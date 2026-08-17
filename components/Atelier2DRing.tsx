"use client";

import { useRef, useMemo, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls, Text } from "@react-three/drei";
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

const GIRDLE_R = 0.16;
const CROWN_H = GIRDLE_R * 0.35;
const PAVILION_H = GIRDLE_R * 0.8;
const PRINCESS_HALF = GIRDLE_R * 1.35;

/* ---------- METAL PHYSICAL MATERIAL (shared) ---------- */
function metalMaterial(metal: [number, number, number]) {
  return (
    <meshPhysicalMaterial
      color={new THREE.Color(metal[0], metal[1], metal[2])}
      metalness={1}
      roughness={0.08}
      envMapIntensity={2.2}
      clearcoat={0.6}
      clearcoatRoughness={0.05}
      anisotropy={0.35}
      anisotropyRotation={0}
      reflectivity={1}
    />
  );
}

/* ---------- RING BAND ---------- */
function RingBand({
  metal,
  width,
}: {
  metal: [number, number, number];
  width: number;
}) {
  const tubeRadius = 0.04 + (width / 5) * 0.06;
  const geometry = useMemo(
    () => new THREE.TorusGeometry(0.5, tubeRadius, 48, 200),
    [tubeRadius]
  );

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      {metalMaterial(metal)}
    </mesh>
  );
}

/* ---------- CATHEDRAL ARCHES (properly anchored to band shoulders) ---------- */
function CathedralArches({ metal, gemY, width }: { metal: [number, number, number]; gemY: number; width: number }) {
  const tubeRadius = 0.04 + (width / 5) * 0.06;

  const { leftCurve, rightCurve } = useMemo(() => {
    const ringR = 0.5;
    const shoulderAngleL = Math.PI * 0.32;
    const shoulderAngleR = Math.PI * 0.68;

    const anchorOnBand = (angle: number) => {
      const cx = Math.cos(angle) * ringR;
      const cz = Math.sin(angle) * ringR;
      return new THREE.Vector3(cx, tubeRadius * 0.6, cz);
    };

    const gemBaseY = gemY - PAVILION_H * 0.2;
    const gemLeft = new THREE.Vector3(-GIRDLE_R * 0.85, gemBaseY, 0);
    const gemRight = new THREE.Vector3(GIRDLE_R * 0.85, gemBaseY, 0);

    const makeArch = (anchorAngle: number, gemSide: THREE.Vector3, sign: number) => {
      const pts: THREE.Vector3[] = [];
      const anchor = anchorOnBand(anchorAngle);

      const mid1 = new THREE.Vector3(
        anchor.x * 0.9 + gemSide.x * 0.1,
        (anchor.y + gemSide.y) * 0.35,
        anchor.z * 0.7 + gemSide.z * 0.3
      );
      const mid2 = new THREE.Vector3(
        anchor.x * 0.5 + gemSide.x * 0.5 + sign * 0.03,
        (anchor.y + gemSide.y) * 0.65,
        anchor.z * 0.4 + gemSide.z * 0.6
      );
      const mid3 = new THREE.Vector3(
        anchor.x * 0.2 + gemSide.x * 0.8 + sign * 0.015,
        gemSide.y - 0.01,
        anchor.z * 0.15 + gemSide.z * 0.85
      );

      pts.push(anchor);
      pts.push(mid1);
      pts.push(mid2);
      pts.push(mid3);
      pts.push(gemSide.clone().add(new THREE.Vector3(0, -0.005, 0)));
      return pts;
    };

    return {
      leftCurve: makeArch(shoulderAngleL, gemLeft, -1),
      rightCurve: makeArch(shoulderAngleR, gemRight, +1),
    };
  }, [gemY, tubeRadius]);

  const leftGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(leftCurve, false, "catmullrom", 0.5);
    return new THREE.TubeGeometry(curve, 60, 0.014, 12, false);
  }, [leftCurve]);

  const rightGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(rightCurve, false, "catmullrom", 0.5);
    return new THREE.TubeGeometry(curve, 60, 0.014, 12, false);
  }, [rightCurve]);

  return (
    <group>
      <mesh geometry={leftGeo} castShadow>
        {metalMaterial(metal)}
      </mesh>
      <mesh geometry={rightGeo} castShadow>
        {metalMaterial(metal)}
      </mesh>
    </group>
  );
}

/* ---------- GEOMETRY HELPERS ---------- */
function segmentsForShape(shape: string): number {
  if (shape === "round") return 32;
  if (shape === "oval" || shape === "pear") return 28;
  return 10;
}

function makeOutline2D(shape: string, segments: number): [number, number][] {
  if (shape === "pear") {
    const pts: [number, number][] = [];
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      pts.push([Math.sin(t) * Math.sin(t / 2), Math.cos(t)]);
    }
    return pts;
  }

  if (shape === "emerald") {
    return [
      [0.55, 1], [1, 0.55], [1, -0.55], [0.55, -1],
      [-0.55, -1], [-1, -0.55], [-1, 0.55], [-0.55, 1],
    ];
  }

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
function buildGemGeometry(shape: string, scale = 1) {
  const s = scale;
  if (shape === "princess") {
    const crown = new THREE.BoxGeometry(PRINCESS_HALF * 2 * s, CROWN_H * s, PRINCESS_HALF * 2 * s);
    crown.translate(0, CROWN_H / 2 * s, 0);

    const pavRadius = PRINCESS_HALF * Math.SQRT2 * s;
    const pavilion = new THREE.ConeGeometry(pavRadius, PAVILION_H * s, 4, 1, false);
    pavilion.rotateY(Math.PI / 4);
    pavilion.rotateX(Math.PI);
    pavilion.translate(0, -PAVILION_H / 2 * s, 0);
      
    return { crown, pavilion };
  }

  const segments = segmentsForShape(shape);
  const outline = makeOutline2D(shape, segments);
  const toV3 = (p: [number, number], sc: number, y: number) =>
    new THREE.Vector3(p[0] * GIRDLE_R * s * sc, y, p[1] * GIRDLE_R * s * sc);

  const girdleRing = outline.map((p) => toV3(p, 1, 0));
  const crownTriangles: THREE.Vector3[][] = [];
  const pavilionTriangles: THREE.Vector3[][] = [];

  if (shape === "emerald") {
    const tableRing = outline.map((p) => toV3(p, 0.45, CROWN_H * s));
    const crownStep = outline.map((p) => toV3(p, 0.75, CROWN_H * 0.5 * s));
    loftRing(girdleRing, crownStep, crownTriangles);
    loftRing(crownStep, tableRing, crownTriangles);
    fanCap(tableRing, new THREE.Vector3(0, CROWN_H * s, 0), crownTriangles);

    const pavStep1 = outline.map((p) => toV3(p, 0.7, -PAVILION_H * 0.45 * s));
    const pavStep2 = outline.map((p) => toV3(p, 0.35, -PAVILION_H * 0.8 * s));
    const culetRing = outline.map((p) => toV3(p, 0.15, -PAVILION_H * s));
    loftRing(girdleRing, pavStep1, pavilionTriangles);
    loftRing(pavStep1, pavStep2, pavilionTriangles);
    loftRing(pavStep2, culetRing, pavilionTriangles);
    fanCap(culetRing, new THREE.Vector3(0, -PAVILION_H * s, 0), pavilionTriangles, true);
  } else {
    const tableRatio = shape === "round" ? 0.56 : 0.5;
    const tableRing = outline.map((p) => toV3(p, tableRatio, CROWN_H * s));

    // Upper girdle facets — thin ring just above the girdle, gives the crown
    // its characteristic crisp break instead of one long sloped facet.
    const upperGirdleRing = outline.map((p) => toV3(p, 0.9, CROWN_H * 0.16 * s));
    const starKiteRatio = shape === "round" ? 0.78 : 0.72;
    const kiteRing = outline.map((p) => toV3(p, starKiteRatio, CROWN_H * 0.48 * s));
    loftRing(girdleRing, upperGirdleRing, crownTriangles);
    loftRing(upperGirdleRing, kiteRing, crownTriangles);
    loftRing(kiteRing, tableRing, crownTriangles);
    fanCap(tableRing, new THREE.Vector3(0, CROWN_H * s, 0), crownTriangles);

    // Lower girdle facets mirror the crown break on the pavilion side.
    const lowerGirdleRing = outline.map((p) => toV3(p, 0.82, -PAVILION_H * 0.14 * s));
    const pavilionMains = outline.map((p) => toV3(p, 0.55, -PAVILION_H * 0.42 * s));
    const pavilionHalves = outline.map((p) => toV3(p, 0.22, -PAVILION_H * 0.78 * s));
    loftRing(girdleRing, lowerGirdleRing, pavilionTriangles);
    loftRing(lowerGirdleRing, pavilionMains, pavilionTriangles);
    loftRing(pavilionMains, pavilionHalves, pavilionTriangles);

    const culet = new THREE.Vector3(0, -PAVILION_H * s, 0);
    fanCap(pavilionHalves, culet, pavilionTriangles, true);
  }

  return {
    crown: trianglesToGeometry(crownTriangles),
    pavilion: trianglesToGeometry(pavilionTriangles),
  };
}

/* ---------- CENTER STONE ---------- */
function CenterStone({
  color,
  shape,
  gemY,
  scale = 1,
  position = [0, 0, 0] as [number, number, number],
}: {
  color: [number, number, number];
  shape: string;
  gemY: number;
  scale?: number;
  position?: [number, number, number];
}) {
  const gem = useMemo(() => buildGemGeometry(shape, scale), [shape, scale]);

  const materialProps = useMemo(
    () => ({
      color: new THREE.Color(color[0], color[1], color[2]),
      metalness: 0,
      roughness: 0.0,
      transmission: 0.96,
      thickness: 0.9,
      ior: 2.42,
      envMapIntensity: 4.6,
      clearcoat: 1,
      clearcoatRoughness: 0,
      specularIntensity: 1.4,
      specularColor: new THREE.Color(1, 1, 1),
      flatShading: true,
      side: THREE.DoubleSide,
      dispersion: 0.12,
      iridescence: 0.15,
      iridescenceIOR: 1.6,
      attenuationDistance: 1.2,
    }),
    [color]
  );

  return (
    <group position={[position[0], position[1] + gemY, position[2]]}>
      <mesh geometry={gem.crown} castShadow>
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh geometry={gem.pavilion} castShadow>
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
    </group>
  );
}

/* ---------- HALO STONES ---------- */
function HaloStones({
  color,
  shape,
  gemY,
}: {
  color: [number, number, number];
  shape: string;
  gemY: number;
}) {
  const haloCount = 18;
  const haloRadius = GIRDLE_R * 1.7;
  const haloSize = 0.022;

  const materialProps = useMemo(
    () => ({
      color: new THREE.Color(color[0], color[1], color[2]),
      metalness: 0,
      roughness: 0.0,
      transmission: 0.97,
      thickness: 0.25,
      ior: 2.42,
      envMapIntensity: 3.8,
      clearcoat: 1,
      clearcoatRoughness: 0,
      specularIntensity: 1.3,
      specularColor: new THREE.Color(1, 1, 1),
      dispersion: 0.08,
    }),
    [color]
  );

  const stones = useMemo(() => {
    const arr = [];
    for (let i = 0; i < haloCount; i++) {
      const a = (i / haloCount) * Math.PI * 2;
      let rx = haloRadius;
      let rz = haloRadius;
      if (shape === "oval") {
        rx = haloRadius * 1.3;
        rz = haloRadius * 0.82;
      }
      if (shape === "pear") {
        const bulge = 1 + 0.15 * Math.sin(a / 2);
        rx = haloRadius * Math.sin(a) * Math.sin(a / 2) * bulge;
        rz = haloRadius * Math.cos(a);
      }
      const x = Math.cos(a) * rx;
      const z = Math.sin(a) * rz;
      const rotY = -a + Math.PI / 2;
      arr.push({ x, z, rotY });
    }
    return arr;
  }, [shape, haloRadius, haloCount]);

  return (
    <group position={[0, gemY, 0]}>
      {stones.map((s, i) => (
        <mesh key={i} position={[s.x, 0, s.z]} rotation={[0, s.rotY, 0]} castShadow>
          <octahedronGeometry args={[haloSize, 0]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- ENGRAVING ---------- */
function EngravingText({
  text,
  metal,
  width,
}: {
  text: string;
  metal: [number, number, number];
  width: number;
}) {
  if (!text || text.trim().length === 0) return null;

  const tubeRadius = 0.04 + (width / 5) * 0.06;
  const ringRadius = 0.5 - tubeRadius * 0.3;
  const displayText = text.slice(0, 25).toUpperCase();
  const charCount = displayText.length;
  const totalAngle = Math.min(charCount * 0.14, Math.PI * 1.4);
  const startAngle = Math.PI - totalAngle / 2;

  const engraveColor = new THREE.Color(metal[0], metal[1], metal[2]);
  engraveColor.offsetHSL(0, 0, -0.22);

  return (
    <group>
      {Array.from(displayText).map((char, i) => {
        const t = charCount === 1 ? 0.5 : i / (charCount - 1);
        const angle = startAngle + totalAngle * t;
        const x = Math.cos(angle) * ringRadius;
        const z = Math.sin(angle) * ringRadius;
        return (
          <Text
            key={i}
            position={[x, -tubeRadius * 0.08, z]}
            rotation={[0, -angle + Math.PI / 2, Math.PI * 0.03]}
            fontSize={0.04}
            maxWidth={0.08}
            lineHeight={1}
            letterSpacing={0.008}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color={`rgb(${Math.floor(engraveColor.r * 255)},${Math.floor(engraveColor.g * 255)},${Math.floor(engraveColor.b * 255)})`}
            outlineWidth={0.0008}
            outlineColor="#000000"
          >
            {char}
          </Text>
        );
      })}
    </group>
  );
}

/* ---------- PRONGS ---------- */
function getProngPositions(shape: string, scale = 1): [number, number][] {
  if (shape === "princess") {
    const r = PRINCESS_HALF * Math.SQRT2 * 0.94 * scale;
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
      ? [0, 2, 4, 6]
      : [Math.round(n * 0.125), Math.round(n * 0.375), Math.round(n * 0.625), Math.round(n * 0.875)];

  return indices.map((i) => {
    const p = outline[i % n];
    return [p[0] * GIRDLE_R * 0.94 * scale, p[1] * GIRDLE_R * 0.94 * scale];
  });
}

function Prongs({
  metal,
  gemY,
  shape,
  scale = 1,
  position = [0, 0, 0] as [number, number, number],
}: {
  metal: [number, number, number];
  gemY: number;
  shape: string;
  scale?: number;
  position?: [number, number, number];
}) {
  const positions2D = useMemo(() => getProngPositions(shape, scale), [shape, scale]);

  const base = gemY - PAVILION_H * 0.18 * scale;
  const grip = gemY + CROWN_H * 0.55 * scale;
  const prongHeight = grip - base;
  const prongRadius = 0.01 + 0.004 * scale;

  return (
    <group position={position}>
      {positions2D.map(([x, z], i) => (
        <mesh key={i} position={[x, base + prongHeight / 2, z]} castShadow>
          <cylinderGeometry args={[prongRadius * 0.6, prongRadius, prongHeight, 10]} />
          {metalMaterial(metal)}
        </mesh>
      ))}
    </group>
  );
}

/* ---------- STUDIO LIGHTING (3-point + sparkle accents) ---------- */
function StudioLighting() {
  const keyRef = useRef<THREE.RectAreaLight>(null);
  const fillRef = useRef<THREE.RectAreaLight>(null);
  const rimRef = useRef<THREE.RectAreaLight>(null);

  useLayoutEffect(() => {
    keyRef.current?.lookAt(0, 0.5, 0);
    fillRef.current?.lookAt(0, 0.5, 0);
    rimRef.current?.lookAt(0, 0.3, 0);
  }, []);

  return (
    <group>
      <ambientLight intensity={0.28} color="#fff8ef" />

      {/* Key — soft neutral-warm, the main shape-and-sparkle light */}
      <rectAreaLight
        ref={keyRef}
        position={[3, 4, 2.5]}
        width={3.2}
        height={2.2}
        intensity={7.5}
        color="#fffaf2"
      />

      {/* Fill — gentle, barely-tinted cool to open up shadows without a colored cast */}
      <rectAreaLight
        ref={fillRef}
        position={[-2.5, 2.6, -2]}
        width={3.4}
        height={2.8}
        intensity={1.8}
        color="#e8f0ff"
      />

      {/* Rim — thin, warm edge light to separate the piece from the background */}
      <rectAreaLight
        ref={rimRef}
        position={[0, 4.5, -3.5]}
        width={5}
        height={2.4}
        intensity={1.6}
        color="#ffe9c7"
      />

      {/* Small, tight highlight sources — these are what give facets a crisp glint
          rather than a diffuse glow, so kept near-white and low spread. */}
      <pointLight position={[0.5, 2.1, 1.0]} intensity={1.6} color="#ffffff" distance={4} decay={2} />
      <pointLight position={[-0.7, 1.4, -0.7]} intensity={0.5} color="#dce6ff" distance={4} decay={2} />
      <pointLight position={[0, 3.2, 0.2]} intensity={0.8} color="#fffdf8" distance={6} decay={2} />

      <spotLight
        position={[0, 6, 0.5]}
        angle={0.42}
        penumbra={0.75}
        intensity={4.2}
        color="#fffaf0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
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
  const settingStyle = (config.settingStyle as string) || "solitaire";
  const bandStyle = (config.bandStyle as string) || "classic";
  const engraving = (config.engraving as string) || "";

  const tubeRadius = 0.04 + (width / 5) * 0.06;
  const ringTop = 0.5 + tubeRadius;
  const gemY = ringTop + 0.02 + (stoneHeight - 0.22) * 0.15;

  const sideStoneScale = 0.55;
  const sideStoneOffset = GIRDLE_R * 2.3;
  const sideStoneGemY = ringTop - 0.06 + (stoneHeight - 0.22) * 0.1;

  return (
    <group ref={groupRef}>
      <StudioLighting />

      <RingBand metal={metal} width={width} />

      {bandStyle === "cathedral" && (
        <CathedralArches metal={metal} gemY={gemY} width={width} />
      )}

      <EngravingText text={engraving} metal={metal} width={width} />

      {settingStyle === "three-stone" && (
        <>
          <CenterStone
            color={stone}
            shape={shape}
            gemY={sideStoneGemY}
            scale={sideStoneScale}
            position={[-sideStoneOffset, 0, 0]}
          />
          <CenterStone
            color={stone}
            shape={shape}
            gemY={sideStoneGemY}
            scale={sideStoneScale}
            position={[sideStoneOffset, 0, 0]}
          />
          <Prongs
            metal={metal}
            gemY={sideStoneGemY}
            shape={shape}
            scale={sideStoneScale}
            position={[-sideStoneOffset, 0, 0]}
          />
          <Prongs
            metal={metal}
            gemY={sideStoneGemY}
            shape={shape}
            scale={sideStoneScale}
            position={[sideStoneOffset, 0, 0]}
          />
        </>
      )}

      {settingStyle === "halo" && <HaloStones color={stone} shape={shape} gemY={gemY} />}

      <CenterStone color={stone} shape={shape} gemY={gemY} />
      <Prongs metal={metal} gemY={gemY} shape={shape} />
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
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: "high-performance",
        }}
      >
        <fog attach="fog" args={["#0a0a0a", 4, 10]} />
        <RingScene config={config} />
        <Environment preset="studio" environmentIntensity={1.85} />
        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={0.35}
          scale={7}
          blur={2.6}
          far={4}
          color="#000000"
        />
        <OrbitControls
          enablePan={false}
          minDistance={1.6}
          maxDistance={4.2}
          minPolarAngle={Math.PI / 7}
          maxPolarAngle={Math.PI / 2 + 0.05}
          autoRotate
          autoRotateSpeed={0.6}
          enableDamping
          dampingFactor={0.04}
        />
      </Canvas>
    </div>
  );
}