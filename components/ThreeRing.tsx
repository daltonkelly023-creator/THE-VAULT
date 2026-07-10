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

function RingBand({ metal, width }: { metal: [number, number, number]; width: number }) {
  const geometry = useMemo(() => {
    const tubeRadius = 0.04 + (width / 5) * 0.06;
    return new THREE.TorusGeometry(0.5, tubeRadius, 32, 100);
  }, [width]);

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial
        color={new THREE.Color(metal[0], metal[1], metal[2])}
        metalness={1.0}
        roughness={0.12}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

function CenterStone({ color, shape, height }: { color: [number, number, number]; shape: string; height: number }) {
  const { geometry, rotation } = useMemo(() => {
    switch (shape) {
      case "princess":
        return {
          geometry: new THREE.BoxGeometry(0.22, 0.22, 0.22),
          rotation: new THREE.Euler(0, Math.PI / 4, 0),
        };
      case "emerald":
        return {
          geometry: new THREE.BoxGeometry(0.26, 0.18, 0.16),
          rotation: new THREE.Euler(0, 0, 0),
        };
      case "oval":
        return {
          geometry: new THREE.SphereGeometry(0.14, 32, 32),
          rotation: new THREE.Euler(0, 0, 0),
        };
      case "pear":
        return {
          geometry: new THREE.SphereGeometry(0.13, 32, 32),
          rotation: new THREE.Euler(0, 0, 0),
        };
      case "round":
      default:
        return {
          geometry: new THREE.OctahedronGeometry(0.16, 0),
          rotation: new THREE.Euler(0, 0, 0),
        };
    }
  }, [shape]);

  const scale = useMemo(() => {
    if (shape === "oval") return [1.3, 0.9, 0.85] as [number, number, number];
    if (shape === "pear") return [0.9, 1.3, 0.85] as [number, number, number];
    return [1, 1, 1] as [number, number, number];
  }, [shape]);

  return (
    <group position={[0, height, 0]} rotation={rotation} scale={scale}>
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
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 6]} />
        <meshBasicMaterial color="white" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Prongs({ metal, gemY }: { metal: [number, number, number]; gemY: number }) {
  const positions: [number, number, number][] = [
    [0.16, gemY - 0.04, 0.16],
    [-0.16, gemY - 0.04, 0.16],
    [0.16, gemY - 0.04, -0.16],
    [-0.16, gemY - 0.04, -0.16],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.012, 0.008, 0.12, 8]} />
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

  return (
    <group ref={groupRef}>
      <RingBand metal={metal} width={width} />
      <CenterStone color={stone} shape={shape} height={stoneHeight} />
      <Prongs metal={metal} gemY={stoneHeight} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 4, 2]} intensity={1.2} castShadow />
      <directionalLight position={[-2, 3, -2]} intensity={0.6} color="#8ab4e8" />
      <pointLight position={[0, 2, 0]} intensity={0.8} color="#ffffff" />
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

export default function ThreeRing({ config }: { config: Record<string, any> }) {
  return (
    <div className="w-full h-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0.8, 2.2], fov: 35 }}
        shadows
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <RingScene config={config} />
        <Environment preset="studio" />
        <ContactShadows
          position={[0, -0.65, 0]}
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
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.8}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}