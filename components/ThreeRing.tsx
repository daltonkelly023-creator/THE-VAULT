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

/* ---------- GEMSTONE GEOMETRIES ---------- */
function Gemstone({ shape, color }: { shape: string; color: string }) {
  const isOpaque = color === "#0A0A0A"; // black diamond

  const materialProps = useMemo(() => {
    if (isOpaque) {
      return {
        color,
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      };
    }
    return {
      color,
      metalness: 0,
      roughness: 0,
      transmission: 0.97,
      thickness: 2,
      ior: 2.4,
      clearcoat: 1,
      clearcoatRoughness: 0,
      attenuationColor: color,
      attenuationDistance: 1,
      dispersion: 0.4,
    };
  }, [color, isOpaque]);

  switch (shape) {
    case "round":
      return (
        <group scale={0.55}>
          {/* Crown (top) */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.28, 0.5, 0.24, 32]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          {/* Girdle */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.06, 32]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          {/* Pavilion (bottom point) */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0, 0.5, 0.4, 32]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case "princess":
      return (
        <mesh scale={[0.5, 0.5, 0.35]}>
          <boxGeometry args={[1, 1, 0.7, 2, 2, 2]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      );

    case "oval":
      return (
        <mesh scale={[0.45, 0.65, 0.35]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      );

    case "pear":
      return (
        <group scale={0.5}>
          <mesh position={[0, 0.15, 0]} scale={[0.45, 0.6, 0.45]}>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, -0.35, 0]} scale={[0.35, 0.5, 0.35]}>
            <coneGeometry args={[0.6, 0.9, 32]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case "emerald":
      return (
        <mesh scale={[0.6, 0.45, 0.3]}>
          <boxGeometry args={[1, 0.8, 0.5, 4, 4, 4]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      );

    default:
      return (
        <mesh scale={0.5}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      );
  }
}

/* ---------- RING BAND ---------- */
function RingBand({ metal, bandWidth }: { metal: string; bandWidth: number }) {
  const color = metalColors[metal] || "#C5A880";
  const roughness = metal === "black-rhodium" ? 0.5 : 0.12;

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.6, 0.07 * Math.max(bandWidth / 2, 0.6), 64, 128]} />
      <meshPhysicalMaterial
        color={color}
        metalness={1}
        roughness={roughness}
        clearcoat={0.8}
        clearcoatRoughness={0.1}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

/* ---------- PRONGS ---------- */
function Prongs({ metal }: { metal: string }) {
  const color = metalColors[metal] || "#C5A880";

  const positions = useMemo(() => {
    return [
      [0.35, 0.35, 0.35],
      [-0.35, 0.35, 0.35],
      [0.35, 0.35, -0.35],
      [-0.35, 0.35, -0.35],
    ] as [number, number, number][];
  }, []);

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.025, 0.015, 0.55, 8]} />
          <meshPhysicalMaterial color={color} metalness={1} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- RING SCENE ---------- */
function RingScene({ config }: { config: Config }) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle idle sway
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    }
  });

  const stoneColor = stoneColors[config.stoneColor as string] || "#E8F8FF";
  const stoneY = 0.45 + (config.stoneHeight as number) * 0.8;

  return (
    <group ref={groupRef} rotation={[0.3, 0, 0]}>
      <RingBand metal={config.metal as string} bandWidth={config.bandWidth as number} />

      {/* Stone Setting */}
      <group position={[0, stoneY, 0]}>
        <Prongs metal={config.metal as string} />
        <Gemstone shape={config.stoneShape as string} color={stoneColor} />

        {/* Sparkle light inside stone */}
        {!stoneColor.includes("0A0A0A") && (
          <pointLight color={stoneColor} intensity={0.8} distance={3} position={[0, 0, 0.2]} />
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
        camera={{ position: [0, 0, 5], fov: 32 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <spotLight position={[4, 6, 4]} angle={0.4} penumbra={0.8} intensity={2.5} castShadow color="#fff5e6" />
        <spotLight position={[-4, 3, -2]} angle={0.5} penumbra={1} intensity={1.5} color="#d4e6ff" />
        <pointLight position={[0, -2, 3]} intensity={0.5} color="#ffecd1" />

        <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.15}>
          <RingScene config={config as Config} />
        </Float>

        <ContactShadows position={[0, -2.4, 0]} opacity={0.35} scale={12} blur={2.5} far={4} />
        <Environment preset="studio" />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.8}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}