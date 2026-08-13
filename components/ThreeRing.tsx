"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";

const metalColors: Record<string, string> = {
  "yellow-gold": "#C5A880",
  "white-gold": "#E8E8E8",
  "rose-gold": "#B76E79",
  "platinum": "#D4D4D4",
  "black-rhodium": "#2A2A2A",
  "sterling-silver": "#C0C0C0",
};

const stoneColors: Record<string, string> = {
  clear: "#E8F8FF",
  black: "#0A0A0A",
  blue: "#1E6FD9",
  champagne: "#F0D878",
  pink: "#E878A8",
  emerald: "#2E8B57",
  ruby: "#D02020",
};

interface Config {
  metal: string;
  stoneShape: string;
  stoneColor: string;
  bandWidth: number;
  stoneHeight: number;
  engraving?: string;
}

/* ---------- STONE GEOMETRY DEFINITIONS ---------- */
// All stones are built in local space with y=0 as the girdle plane.
// Returns the mesh, the horizontal girdle radius, and total height.

interface StoneDef {
  mesh: React.ReactNode;
  girdleRadius: number;
  totalHeight: number;
}

function getStoneDef(shape: string, color: string, isOpaque: boolean): StoneDef {
  const mat = isOpaque
    ? { color, metalness: 0.95, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }
    : {
        color,
        metalness: 0.05,
        roughness: 0,
        transmission: 0.96,
        thickness: 2.5,
        ior: 2.42,
        clearcoat: 1,
        clearcoatRoughness: 0,
        attenuationColor: color,
        attenuationDistance: 1.2,
        dispersion: 0.35,
      };

  switch (shape) {
    case "round": {
      // Round brilliant: table → crown → girdle → pavilion → culet
      const girdleR = 0.42;
      return {
        girdleRadius: girdleR,
        totalHeight: 0.76,
        mesh: (
          <group>
            {/* Table */}
            <mesh position={[0, 0.24, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            {/* Crown: narrows from girdle (0.42) up to table (0.22) */}
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.22, 0.42, 0.12, 16]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            {/* Girdle */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.42, 0.42, 0.06, 16]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            {/* Pavilion: tapers from girdle (0.42) down to point (0) */}
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.42, 0.0, 0.38, 16]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            {/* Culet */}
            <mesh position={[0, -0.41, 0]}>
              <coneGeometry args={[0.02, 0.02, 8]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
          </group>
        ),
      };
    }

    case "princess": {
      const halfW = 0.31;
      return {
        girdleRadius: halfW * Math.SQRT2,
        totalHeight: 0.72,
        mesh: (
          <group>
            <mesh position={[0, 0.20, 0]}>
              <boxGeometry args={[0.5, 0.14, 0.5]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.62, 0.10, 0.62]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.62, 0.06, 0.62]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            {/* 4-sided pyramid, point DOWN */}
            <mesh position={[0, -0.20, 0]}>
              <cylinderGeometry args={[0.44, 0.0, 0.34, 4]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
          </group>
        ),
      };
    }

    case "oval": {
      const sx = 0.32, sy = 0.42, sz = 0.26;
      return {
        girdleRadius: sx * 0.65,
        totalHeight: sy * 1.3,
        mesh: (
          <group scale={[sx, sy, sz]}>
            <mesh>
              <sphereGeometry args={[0.65, 32, 32]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
          </group>
        ),
      };
    }

    case "pear": {
      const girdleR = 0.35;
      return {
        girdleRadius: girdleR,
        totalHeight: 0.85,
        mesh: (
          <group scale={0.42}>
            {/* Round top */}
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.38, 20, 20]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            {/* Tapered bottom — cone pointing DOWN */}
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.38, 0.0, 0.55, 20]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            {/* Flat table */}
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.22, 0.28, 0.08, 12]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
          </group>
        ),
      };
    }

    case "emerald": {
      const hx = 0.45, hz = 0.275;
      return {
        girdleRadius: Math.sqrt(hx * hx + hz * hz),
        totalHeight: 0.64,
        mesh: (
          <group scale={[0.44, 0.32, 0.30]}>
            <mesh>
              <boxGeometry args={[0.9, 0.70, 0.55, 2, 2, 2]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            <mesh position={[0, 0.32, 0]}>
              <boxGeometry args={[0.72, 0.12, 0.44]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
            <mesh position={[0, -0.32, 0]}>
              <boxGeometry args={[0.72, 0.12, 0.44]} />
              <meshPhysicalMaterial {...mat} />
            </mesh>
          </group>
        ),
      };
    }

    default: {
      return {
        girdleRadius: 0.35,
        totalHeight: 0.6,
        mesh: (
          <mesh scale={0.4}>
            <octahedronGeometry args={[0.6, 2]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
        ),
      };
    }
  }
}

/* ---------- PRONG SETTING ---------- */
function ProngSetting({
  metal,
  girdleRadius,
  shape,
}: {
  metal: string;
  girdleRadius: number;
  shape: string;
}) {
  const color = metalColors[metal] || "#C5A880";
  const prongR = girdleRadius * 0.94; // slightly inside stone edge
  const prongH = 0.18;
  const baseY = -0.06;

  const angles = useMemo(() => {
    switch (shape) {
      case "round":
        return [0, Math.PI / 2, Math.PI, -Math.PI / 2];
      case "princess":
      case "emerald":
        return [Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4, -Math.PI / 4];
      case "oval":
        return [0, Math.PI / 2, Math.PI, -Math.PI / 2];
      case "pear":
        return [Math.PI / 3, (2 * Math.PI) / 3, -Math.PI / 2];
      default:
        return [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    }
  }, [shape]);

  return (
    <group>
      {/* Prongs */}
      {angles.map((a, i) => {
        const px = Math.cos(a) * prongR;
        const pz = Math.sin(a) * prongR;
        const midY = baseY + prongH / 2;
        const tilt = 0.22;
        const rotY = -a + Math.PI / 2;
        return (
          <group key={i} position={[px, midY, pz]}>
            <mesh rotation={[tilt, rotY, 0]}>
              <cylinderGeometry args={[0.012, 0.008, prongH, 8]} />
              <meshPhysicalMaterial color={color} metalness={1} roughness={0.1} />
            </mesh>
            {/* Tip ball grips the crown just above girdle */}
            <mesh position={[0, prongH / 2, 0]}>
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshPhysicalMaterial color={color} metalness={1} roughness={0.1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ---------- GALLERY (connects band to setting) ---------- */
function Gallery({
  metal,
  girdleRadius,
  lift,
  tubeRadius,
}: {
  metal: string;
  girdleRadius: number;
  lift: number;
  tubeRadius: number;
}) {
  const color = metalColors[metal] || "#C5A880";
  const basketR = girdleRadius * 0.62;
  const galleryH = lift - tubeRadius - 0.04; // space between band top and prong base
  if (galleryH <= 0.02) return null;

  const midY = tubeRadius + galleryH / 2;

  return (
    <group position={[0, midY, 0]}>
      {/* Open gallery cylinder */}
      <mesh>
        <cylinderGeometry args={[basketR, basketR * 0.85, galleryH, 16, 1, true]} />
        <meshPhysicalMaterial
          color={color}
          metalness={1}
          roughness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Top ring */}
      <mesh position={[0, galleryH / 2, 0]}>
        <torusGeometry args={[basketR, 0.012, 8, 24]} />
        <meshPhysicalMaterial color={color} metalness={1} roughness={0.1} />
      </mesh>
      {/* Bottom ring */}
      <mesh position={[0, -galleryH / 2, 0]}>
        <torusGeometry args={[basketR * 0.85, 0.012, 8, 24]} />
        <meshPhysicalMaterial color={color} metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
}

/* ---------- RING BAND ---------- */
function RingBand({ metal, bandWidth }: { metal: string; bandWidth: number }) {
  const color = metalColors[metal] || "#C5A880";
  const roughness = metal === "black-rhodium" ? 0.55 : 0.12;
  const tubeR = 0.065 * Math.max(bandWidth / 2.2, 0.55);

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[1.55, tubeR, 64, 128]} />
        <meshPhysicalMaterial
          color={color}
          metalness={1}
          roughness={roughness}
          clearcoat={0.9}
          clearcoatRoughness={0.08}
          envMapIntensity={1.3}
        />
      </mesh>
    </group>
  );
}

/* ---------- RING SCENE ---------- */
function RingScene({ config }: { config: Config }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.02;
    }
  });

  const stoneColor = stoneColors[config.stoneColor as string] || "#E8F8FF";
  const isOpaque = stoneColor === "#0A0A0A";

  const stoneDef = useMemo(
    () => getStoneDef(config.stoneShape as string, stoneColor, isOpaque),
    [config.stoneShape, stoneColor, isOpaque]
  );

  const tubeR = 0.065 * Math.max((config.bandWidth as number) / 2.2, 0.55);
  const lift = tubeR + 0.14 + (config.stoneHeight as number) * 0.45;

  return (
    <group ref={groupRef} rotation={[0.25, 0, 0]}>
      <RingBand metal={config.metal as string} bandWidth={config.bandWidth as number} />

      {/* Gallery bridges band to setting */}
      <Gallery
        metal={config.metal as string}
        girdleRadius={stoneDef.girdleRadius}
        lift={lift}
        tubeRadius={tubeR}
      />

      {/* Stone Setting */}
      <group position={[0, lift, 0]}>
        <ProngSetting
          metal={config.metal as string}
          girdleRadius={stoneDef.girdleRadius}
          shape={config.stoneShape as string}
        />
        {stoneDef.mesh}

        {!isOpaque && (
          <pointLight
            color={stoneColor}
            intensity={0.5}
            distance={2}
            position={[0.08, 0.08, 0.12]}
          />
        )}
      </group>
    </group>
  );
}

/* ---------- MAIN EXPORT ---------- */
export default function ThreeRing({ config }: { config: Record<string, any> }) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.5, 4.5], fov: 28 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.35} />
        <spotLight
          position={[3, 5, 3]}
          angle={0.35}
          penumbra={0.7}
          intensity={2.2}
          castShadow
          color="#fff8f0"
        />
        <spotLight
          position={[-3, 3, -2]}
          angle={0.5}
          penumbra={0.9}
          intensity={1.4}
          color="#e0ecff"
        />
        <pointLight position={[0, -2, 2]} intensity={0.4} color="#ffe8d1" />

        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.12}>
          <RingScene config={config as Config} />
        </Float>

        <ContactShadows
          position={[0, -2.2, 0]}
          opacity={0.3}
          scale={10}
          blur={2.5}
          far={4}
        />
        <Environment preset="studio" />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={7}
          autoRotate
          autoRotateSpeed={0.6}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}