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

/* ---------- RING BAND ---------- */
function RingBand({ metal, width }: { metal: [number, number, number]; width: number }) {
  const geometry = useMemo(() => {
    const tubeRadius = 0.04 + (width / 5) * 0.06;
    // Torus standing upright like a real ring on finger
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

/* ---------- CENTER STONE ---------- */
function CenterStone({ color, shape, height }: { color: [number, number, number]; shape: string; height: number }) {
  const { geometry } = useMemo(() => {
    switch (shape) {
      case "princess":
        return {
          geometry: new THREE.BoxGeometry(0.22, 0.18, 0.22),
        };
      case "emerald":
        return {
          geometry: new THREE.BoxGeometry(0.26, 0.14, 0.18),
        };
      case "oval":
        return {
          geometry: new THREE.SphereGeometry(0.14, 32, 32),
        };
      case "pear":
        return {
          geometry: new THREE.SphereGeometry(0.13, 32, 32),
        };
      case "round":
      default:
        return {
          geometry: new THREE.OctahedronGeometry(0.16, 0),
        };
    }
  }, [shape]);

  const scale = useMemo(() => {
    if (shape === "oval") return [1.3, 0.85, 0.85] as [number, number, number];
    if (shape === "pear") return [0.85, 0.85, 1.3] as [number, number, number];
    return [1, 1, 1] as [number, number, number];
  }, [shape]);

  // Gem sits on TOP of ring (Y axis), not in the hole
  // Ring major radius = 0.5, tube radius ~0.08
  // Top of ring = Y = 0.5 + tubeRadius ≈ 0.58
  const tubeRadius = 0.04 + (height / 5) * 0.06;
  const ringTop = 0.5 + tubeRadius;
  const gemY = ringTop + 0.06; // Slightly above ring surface

  return (
    <group position={[0, gemY, 0]} scale={scale}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          color={new THREE.Color(color[0], color[1], color[2])}
          metalness={0}
          roughness={0}
          transmission={0.92}
          thickness={0.6}
          ior={2.42}
          envMapIntensity={2.5}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>
      {/* Table facet reflection */}
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 6]} />
        <meshBasicMaterial color="white" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ---------- PRONGS ---------- */
function Prongs({ metal, gemY }: { metal: [number, number, number]; gemY: number }) {
  // Prongs rise from ring surface up to grip gem
  const tubeRadius = 0.08; // Approximate
  const ringTop = 0.5 + tubeRadius;
  const prongHeight = gemY - ringTop + 0.04;

  const positions: [number, number, number][] = [
    [0.14, ringTop + prongHeight / 2, 0.14],
    [-0.14, ringTop + prongHeight / 2, 0.14],
    [0.14, ringTop + prongHeight / 2, -0.14],
    [-0.14, ringTop + prongHeight / 2, -0.14],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.012, 0.008, prongHeight, 8]} />
          <meshStandardMaterial
            color={new THREE.Color(metal[0], metal[1], metal[2])}
            metalness={1}
            roughness={0.2}
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

  // Calculate gem Y position for prongs
  const tubeRadius = 0.04 + (width / 5) * 0.06;
  const ringTop = 0.5 + tubeRadius;
  const gemY = ringTop + 0.06 + (stoneHeight - 0.22) * 0.2;

  return (
    <group ref={groupRef}>
      <RingBand metal={metal} width={width} />
      <CenterStone color={stone} shape={shape} height={stoneHeight} />
      <Prongs metal={metal} gemY={gemY} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 4, 2]} intensity={1.2} castShadow />
      <directionalLight position={[-2, 3, -2]} intensity={0.6} color="#8ab4e8" />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#ffffff" />
      <spotLight
        position={[0, 5, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={0.8}
        castShadow
      />
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
        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={0.4}
          scale={6}
          blur={2}
          far={3}
        />
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