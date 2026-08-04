"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const metalMap: Record<string, [number, number, number]> = {
  "yellow-gold": [0.77, 0.7, 0.5],
  "white-gold": [0.85, 0.85, 0.88],
  "rose-gold": [0.72, 0.45, 0.45],
  "platinum": [0.83, 0.83, 0.85],
  "black-rhodium": [0.15, 0.15, 0.17],
  "sterling-silver": [0.75, 0.75, 0.78],
};

const stoneMap: Record<string, [number, number, number]> = {
  clear: [0.9, 0.95, 1.0],
  black: [0.04, 0.04, 0.05],
  blue: [0.12, 0.43, 0.85],
  champagne: [0.94, 0.85, 0.47],
  pink: [0.91, 0.47, 0.66],
  emerald: [0.18, 0.55, 0.34],
  ruby: [0.82, 0.13, 0.13],
};

/* Shared gem dimensions — used for the gem geometry AND prong placement,
   so prongs always grip where the girdle actually sits. */
const GIRDLE_R = 0.16;
const CROWN_H = GIRDLE_R * 0.35;
const PAVILION_H = GIRDLE_R * 0.8;
const PRINCESS_HALF = GIRDLE_R * 1.35;

/* ---------- RING BAND ---------- */
function RingBand({ metal, width }: { metal: [number, number, number]; width: number }) {
  const geometry = useMemo(() => {
    const tubeRadius = 0.04 + (width / 5) * 0.06;
    return new THREE.TorusGeometry(0.5, tubeRadius, 32, 100);
  }, [width]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={new THREE.Color(metal[0], metal[1], metal[2])}
        metalness={1.0}
        roughness={0.12}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

/* ---------- GEOMETRY HELPERS ----------
   Build faceted gems from a flat 2D outline (the girdle silhouette,
   in the x/z plane, radius ~1) instead of leaning on primitives.
   This is what lets oval/pear/emerald have their own real silhouette
   instead of a stretched circle. */

function segmentsForShape(shape: string): number {
  if (shape === "round") return 16;
  if (shape === "oval" || shape === "pear") return 14;
  return 8; // emerald ignores this — fixed 8-point outline below
}

function makeOutline2D(shape: string, segments: number): [number, number][] {
  if (shape === "pear") {
    // Classic teardrop parametric curve: pinches to a point at t=0,
    // rounds out at t=π. Produces a ~1.5:1 length:width ratio, which
    // matches real pear-cut proportions without any extra scaling.
    const pts: [number, number][] = [];
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      pts.push([Math.sin(t) * Math.sin(t / 2), Math.cos(t)]);
    }
    return pts;
  }

  if (shape === "emerald") {
    // Elongated clipped-corner rectangle (the classic emerald-cut
    // girdle silhouette). Fixed points, not procedurally generated.
    return [
      [0.55, 1], [1, 0.55], [1, -0.55], [0.55, -1],
      [-0.55, -1], [-1, -0.55], [-1, 0.55], [-0.55, 1],
    ];
  }

  // Round and oval share a circular/elliptical outline — oval's
  // ellipse is baked directly into the radii, not applied as a
  // later group scale, so its facets follow the true elongated shape.
  const rx = shape === "oval" ? 1.3 : 1;
  const rz = shape === "oval" ? 0.82 : 1;
  const pts: [number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push([Math.cos(a) * rx, Math.sin(a) * rz]);
  }
  return pts;
}

function trianglesToGeometry(triangles: THREE.Vector3[][]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  triangles.forEach((tri) => tri.forEach((v) => positions.push(v.x, v.y, v.z)));
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function loftRing(lower: THREE.Vector3[], upper: THREE.Vector3[], out: THREE.Vector3[][]) {
  const n = lower.length;
  for (let i = 0; i < n; i++) {
    const a = lower[i];
    const b = lower[(i + 1) % n];
    const c = upper[i];
    const d = upper[(i + 1) % n];
    out.push([a, b, d]);
    out.push([a, d, c]);
  }
}

function fanCap(points: THREE.Vector3[], center: THREE.Vector3, out: THREE.Vector3[][], flip = false) {
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    out.push(flip ? [center, b, a] : [center, a, b]);
  }
}

/* ---------- FACETED GEM GEOMETRY ---------- */
function buildGemGeometry(shape: string) {
  if (shape === "princess") {
    const crown = new THREE.BoxGeometry(PRINCESS_HALF * 2, CROWN_H, PRINCESS_HALF * 2);
    crown.translate(0, CROWN_H / 2, 0);

    const pavRadius = PRINCESS_HALF * Math.SQRT2; // circumscribe the square corners
    const pavilion = new THREE.ConeGeometry(pavRadius, PAVILION_H, 4, 1, false);
    pavilion.rotateY(Math.PI / 4);
    pavilion.rotateX(Math.PI);
    pavilion.translate(0, -PAVILION_H / 2, 0);

    return { crown, pavilion };
  }

  const segments = segmentsForShape(shape);
  const outline = makeOutline2D(shape, segments);
  const toV3 = (p: [number, number], scale: number, y: number) =>
    new THREE.Vector3(p[0] * GIRDLE_R * scale, y, p[1] * GIRDLE_R * scale);

  const girdleRing = outline.map((p) => toV3(p, 1, 0));
  const crownTriangles: THREE.Vector3[][] = [];
  const pavilionTriangles: THREE.Vector3[][] = [];

  if (shape === "emerald") {
    // True step cut: terraced rings instead of one smooth taper —
    // this is what gives emerald cuts their "hall of mirrors" look,
    // structurally different from a brilliant's radial facets.
    const tableRing = outline.map((p) => toV3(p, 0.45, CROWN_H));
    const crownStep = outline.map((p) => toV3(p, 0.75, CROWN_H * 0.5));
    loftRing(girdleRing, crownStep, crownTriangles);
    loftRing(crownStep, tableRing, crownTriangles);
    fanCap(tableRing, new THREE.Vector3(0, CROWN_H, 0), crownTriangles);

    const pavStep1 = outline.map((p) => toV3(p, 0.7, -PAVILION_H * 0.45));
    const pavStep2 = outline.map((p) => toV3(p, 0.35, -PAVILION_H * 0.8));
    const culetRing = outline.map((p) => toV3(p, 0.15, -PAVILION_H));
    loftRing(girdleRing, pavStep1, pavilionTriangles);
    loftRing(pavStep1, pavStep2, pavilionTriangles);
    loftRing(pavStep2, culetRing, pavilionTriangles);
    fanCap(culetRing, new THREE.Vector3(0, -PAVILION_H, 0), pavilionTriangles, true);
  } else {
    const tableRatio = shape === "round" ? 0.56 : 0.5;
    const tableRing = outline.map((p) => toV3(p, tableRatio, CROWN_H));
    loftRing(girdleRing, tableRing, crownTriangles);
    fanCap(tableRing, new THREE.Vector3(0, CROWN_H, 0), crownTriangles);

    const culet = new THREE.Vector3(0, -PAVILION_H, 0);
    fanCap(girdleRing, culet, pavilionTriangles, true);
  }

  return {
    crown: trianglesToGeometry(crownTriangles),
    pavilion: trianglesToGeometry(pavilionTriangles),
  };
}

/* ---------- CENTER STONE ---------- */
function CenterStone({ color, shape, gemY }: { color: [number, number, number]; shape: string; gemY: number }) {
  const gem = useMemo(() => buildGemGeometry(shape), [shape]);

  const materialProps = {
    color: new THREE.Color(color[0], color[1], color[2]),
    metalness: 0,
    roughness: 0.02,
    transmission: 0.92,
    thickness: 0.6,
    ior: 2.42,
    envMapIntensity: 3,
    clearcoat: 1,
    clearcoatRoughness: 0,
    flatShading: true,
    side: THREE.DoubleSide, // safety net for any winding-order edge cases in the hand-built geometries
  };

  return (
    <group position={[0, gemY, 0]}>
      <mesh geometry={gem.crown} castShadow>
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh geometry={gem.pavilion} castShadow>
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
    </group>
  );
}

/* ---------- PRONGS ----------
   Prong positions are sampled from the SAME outline used to build the
   gem, so they always sit on the actual silhouette — the corners of a
   princess or emerald cut, the shoulders of a pear, etc. — instead of
   a fixed radius that only makes sense for a circle. */
function getProngPositions(shape: string): [number, number][] {
  if (shape === "princess") {
    const r = PRINCESS_HALF * Math.SQRT2 * 0.94;
    return [45, 135, 225, 315].map((d) => {
      const a = (d * Math.PI) / 180;
      return [Math.cos(a) * r, Math.sin(a) * r];
    });
  }

  const segments = segmentsForShape(shape);
  const outline = makeOutline2D(shape, segments);
  const n = outline.length;
  const indices =
    shape === "emerald"
      ? [0, 2, 4, 6] // the four corner facets of the clipped rectangle
      : [Math.round(n * 0.125), Math.round(n * 0.375), Math.round(n * 0.625), Math.round(n * 0.875)];

  return indices.map((i) => {
    const p = outline[i % n];
    return [p[0] * GIRDLE_R * 0.94, p[1] * GIRDLE_R * 0.94];
  });
}

function Prongs({ metal, gemY, shape }: { metal: [number, number, number]; gemY: number; shape: string }) {
  const positions2D = useMemo(() => getProngPositions(shape), [shape]);

  const base = gemY - PAVILION_H * 0.15; // start slightly into the pavilion
  const grip = gemY + CROWN_H * 0.4; // grip a short way up into the crown
  const prongHeight = grip - base;

  return (
    <group>
      {positions2D.map(([x, z], i) => (
        <mesh key={i} position={[x, base + prongHeight / 2, z]} castShadow>
          <cylinderGeometry args={[0.012, 0.017, prongHeight, 8]} />
          <meshStandardMaterial
            color={new THREE.Color(metal[0], metal[1], metal[2])}
            metalness={1}
            roughness={0.15}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- SCENE ---------- */
function RingScene({ config }: { config: Record<string, any> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const metal = metalMap[(config.metal as string) || "yellow-gold"];
  const stone = stoneMap[(config.stoneColor as string) || "clear"];
  const width = (config.bandWidth as number) || 2;
  const shape = (config.stoneShape as string) || "round";
  const stoneHeight = (config.stoneHeight as number) || 0.22;

  const tubeRadius = 0.04 + (width / 5) * 0.06;
  const ringTop = 0.5 + tubeRadius;
  const gemY = ringTop + 0.02 + (stoneHeight - 0.22) * 0.15;

  return (
    <group ref={groupRef}>
      <RingBand metal={metal} width={width} />
      <CenterStone color={stone} shape={shape} gemY={gemY} />
      <Prongs metal={metal} gemY={gemY} shape={shape} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 4, 2]} intensity={1.2} castShadow />
      <directionalLight position={[-2, 3, -2]} intensity={0.6} color="#8ab4e8" />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#ffffff" />
      <spotLight position={[0, 5, 0]} angle={0.3} penumbra={0.5} intensity={0.8} castShadow />
    </group>
  );
}

/* ---------- EXPORT ---------- */
export default function ThreeRing({ config }: { config: Record<string, any> }) {
  return (
    <div className="w-full h-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 1.2, 2.5], fov: 35 }}
        shadows
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <RingScene config={config} />
        <Environment preset="studio" />
        <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={6} blur={2} far={3} />
        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={4}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={0.8}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}