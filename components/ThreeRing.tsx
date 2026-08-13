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

/* ---------- FACETED GEMSTONE ---------- */
function FacetedGem({ shape, color }: { shape: string; color: string }) {
  const isOpaque = color === "#0A0A0A";

  const mat = useMemo(() => {
    if (isOpaque) {
      return {
        color,
        metalness: 0.95,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      };
    }
    return {
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
  }, [color, isOpaque]);

  switch (shape) {
    case "round":
      return (
        <group scale={0.38}>
          {/* Table (flat top) */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.22, 0.35, 0.18, 16]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Crown (upper angled part) */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.35, 0.42, 0.12, 16]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Girdle (thin center band) */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.06, 16]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Pavilion (lower cone) */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.15, 0.42, 0.38, 16]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Culet (tiny bottom point) */}
          <mesh position={[0, -0.42, 0]}>
            <coneGeometry args={[0.15, 0.04, 16]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
        </group>
      );

    case "princess":
      return (
        <group scale={0.42}>
          {/* Table */}
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.5, 0.14, 0.5]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Crown */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.62, 0.1, 0.62]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Girdle */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.62, 0.06, 0.62]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Pavilion */}
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.44, 0.34, 4]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
        </group>
      );

    case "oval":
      return (
        <group scale={[0.32, 0.42, 0.26]}>
          {/* Smooth oval body with slight faceting via segments */}
          <mesh>
            <sphereGeometry args={[0.65, 24, 24]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Flatten top/bottom slightly */}
          <mesh position={[0, 0.35, 0]} scale={[1, 0.3, 1]}>
            <sphereGeometry args={[0.55, 16, 8]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
        </group>
      );

    case "pear":
      return (
        <group scale={0.42}>
          {/* Round top */}
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.38, 20, 20]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Tapered bottom */}
          <mesh position={[0, -0.22, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.38, 0.55, 20]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Flat table on top */}
          <mesh position={[0, 0.38, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 0.08, 12]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
        </group>
      );

    case "emerald":
      return (
        <group scale={[0.44, 0.32, 0.3]}>
          {/* Main body */}
          <mesh>
            <boxGeometry args={[0.9, 0.7, 0.55, 2, 2, 2]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Crown step */}
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.7, 0.12, 0.42]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
          {/* Pavilion step */}
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.7, 0.12, 0.42]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh scale={0.4}>
          <octahedronGeometry args={[0.6, 2]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
      );
  }
}

/* ---------- PRONG SETTING ---------- */
function ProngSetting({ metal, shape }: { metal: string; shape: string }) {
  const color = metalColors[metal] || "#C5A880";

  // Prong positions based on stone shape
  const prongConfigs = useMemo(() => {
    switch (shape) {
      case "round":
        return [
          { pos: [0.22, 0.05, 0.22], rot: [-0.3, 0.8, 0.3] },
          { pos: [-0.22, 0.05, 0.22], rot: [-0.3, -0.8, -0.3] },
          { pos: [0.22, 0.05, -0.22], rot: [0.3, 0.8, 0.3] },
          { pos: [-0.22, 0.05, -0.22], rot: [0.3, -0.8, -0.3] },
        ];
      case "princess":
        return [
          { pos: [0.28, 0.05, 0.28], rot: [-0.35, 0, 0.35] },
          { pos: [-0.28, 0.05, 0.28], rot: [-0.35, 0, -0.35] },
          { pos: [0.28, 0.05, -0.28], rot: [0.35, 0, 0.35] },
          { pos: [-0.28, 0.05, -0.28], rot: [0.35, 0, -0.35] },
        ];
      case "oval":
        return [
          { pos: [0.18, 0.05, 0.28], rot: [-0.3, 0.5, 0.2] },
          { pos: [-0.18, 0.05, 0.28], rot: [-0.3, -0.5, -0.2] },
          { pos: [0.18, 0.05, -0.28], rot: [0.3, 0.5, 0.2] },
          { pos: [-0.18, 0.05, -0.28], rot: [0.3, -0.5, -0.2] },
        ];
      case "pear":
        return [
          { pos: [0.2, 0.05, 0.18], rot: [-0.3, 0.6, 0.25] },
          { pos: [-0.2, 0.05, 0.18], rot: [-0.3, -0.6, -0.25] },
          { pos: [0, 0.05, -0.32], rot: [0.4, 0, 0] },
        ];
      case "emerald":
        return [
          { pos: [0.32, 0.05, 0.22], rot: [-0.25, 0.4, 0.3] },
          { pos: [-0.32, 0.05, 0.22], rot: [-0.25, -0.4, -0.3] },
          { pos: [0.32, 0.05, -0.22], rot: [0.25, 0.4, 0.3] },
          { pos: [-0.32, 0.05, -0.22], rot: [0.25, -0.4, -0.3] },
        ];
      default:
        return [
          { pos: [0.22, 0.05, 0.22], rot: [-0.3, 0.8, 0.3] },
          { pos: [-0.22, 0.05, 0.22], rot: [-0.3, -0.8, -0.3] },
          { pos: [0.22, 0.05, -0.22], rot: [0.3, 0.8, 0.3] },
          { pos: [-0.22, 0.05, -0.22], rot: [0.3, -0.8, -0.3] },
        ];
    }
  }, [shape]);

  return (
    <group>
      {/* Setting basket (small ring under stone) */}
      <mesh position={[0, -0.08, 0]}>
        <torusGeometry args={[0.18, 0.015, 8, 24]} />
        <meshPhysicalMaterial color={color} metalness={1} roughness={0.12} />
      </mesh>

      {/* Prongs */}
      {prongConfigs.map((cfg, i) => (
        <group key={i} position={cfg.pos as [number, number, number]}>
          <mesh rotation={cfg.rot as [number, number, number]}>
            <cylinderGeometry args={[0.012, 0.008, 0.28, 8]} />
            <meshPhysicalMaterial color={color} metalness={1} roughness={0.1} />
          </mesh>
          {/* Prong tip (small ball) */}
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshPhysicalMaterial color={color} metalness={1} roughness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- RING BAND ---------- */
function RingBand({ metal, bandWidth }: { metal: string; bandWidth: number }) {
  const color = metalColors[metal] || "#C5A880";
  const roughness = metal === "black-rhodium" ? 0.55 : 0.12;

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[1.55, 0.065 * Math.max(bandWidth / 2.2, 0.55), 64, 128]} />
        <meshPhysicalMaterial
          color={color}
          metalness={1}
          roughness={roughness}
          clearcoat={0.9}
          clearcoatRoughness={0.08}
          envMapIntensity={1.3}
        />
      </mesh>
      {/* Inner comfort fit (slightly rounded inner edge) */}
      <mesh scale={[0.98, 0.98, 0.95]}>
        <torusGeometry args={[1.55, 0.065 * Math.max(bandWidth / 2.2, 0.55), 32, 64]} />
        <meshPhysicalMaterial
          color={color}
          metalness={1}
          roughness={roughness + 0.05}
          envMapIntensity={0.8}
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
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.025;
    }
  });

  const stoneColor = stoneColors[config.stoneColor as string] || "#E8F8FF";
  const lift = 0.18 + (config.stoneHeight as number) * 0.6;

  return (
    <group ref={groupRef} rotation={[0.25, 0, 0]}>
      <RingBand metal={config.metal as string} bandWidth={config.bandWidth as number} />

      {/* Stone Setting */}
      <group position={[0, lift, 0]}>
        <ProngSetting metal={config.metal as string} shape={config.stoneShape as string} />
        <FacetedGem shape={config.stoneShape as string} color={stoneColor} />

        {/* Internal sparkle for transparent stones */}
        {!stoneColor.includes("0A0A0A") && (
          <pointLight color={stoneColor} intensity={0.6} distance={2.5} position={[0.1, 0.1, 0.15]} />
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
        camera={{ position: [0, 0.5, 4.2], fov: 30 }}
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