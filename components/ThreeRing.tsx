"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const metalMap: Record<string, string> = {
  "yellow-gold": "#C5A880",
  "white-gold": "#E8E8E8",
  "rose-gold": "#B76E79",
  "platinum": "#D4D4D4",
  "black-rhodium": "#2A2A2A",
  "sterling-silver": "#C0C0C0",
};

const stoneMap: Record<string, string> = {
  clear: "#E8F8FF",
  black: "#0A0A0A",
  blue: "#1E6FD9",
  champagne: "#F0D878",
  pink: "#E878A8",
  emerald: "#2E8B57",
  ruby: "#D02020",
};

function Band({ metal, width }: { metal: string; width: number }) {
  const geometry = useMemo(() => {
    return new THREE.TorusGeometry(1, 0.12 * (width / 2.5), 32, 100);
  }, [width]);

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial
        color={metal}
        metalness={1}
        roughness={0.15}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

function Gem({ color, shape }: { color: string; shape: string }) {
  const geometry = useMemo(() => {
    switch (shape) {
      case "princess":
        return new THREE.BoxGeometry(0.5, 0.5, 0.5);
      case "emerald":
        return new THREE.BoxGeometry(0.6, 0.4, 0.4);
      case "oval":
        return new THREE.SphereGeometry(0.32, 32, 32);
      case "pear":
        return new THREE.SphereGeometry(0.32, 32, 32);
      case "round":
      default:
        return new THREE.CylinderGeometry(0.32, 0.32, 0.35, 32);
    }
  }, [shape]);

  const scale = useMemo(() => {
    if (shape === "oval") return [1.4, 1, 0.85] as [number, number, number];
    if (shape === "pear") return [1, 1.4, 0.85] as [number, number, number];
    if (shape === "emerald") return [1.3, 1, 0.9] as [number, number, number];
    return [1, 1, 1] as [number, number, number];
  }, [shape]);

  return (
    <mesh geometry={geometry} position={[0, 0.28, 0]} scale={scale} castShadow>
      <meshPhysicalMaterial
        color={color}
        metalness={0}
        roughness={0}
        transmission={0.95}
        thickness={0.8}
        ior={2.4}
        envMapIntensity={2}
        clearcoat={1}
        clearcoatRoughness={0}
      />
    </mesh>
  );
}

function Prongs({ metal }: { metal: string }) {
  const positions: [number, number, number][] = [
    [0.22, 0.25, 0.22],
    [-0.22, 0.25, 0.22],
    [0.22, 0.25, -0.22],
    [-0.22, 0.25, -0.22],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.02, 0.015, 0.22, 8]} />
          <meshStandardMaterial color={metal} metalness={1} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ config }: { config: Record<string, any> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.25) * 0.25;
    }
  });

  const metal = metalMap[(config.metal as string) || "yellow-gold"];
  const stone = stoneMap[(config.stoneColor as string) || "clear"];
  const width = (config.bandWidth as number) || 2;
  const shape = (config.stoneShape as string) || "round";

  return (
    <group ref={groupRef}>
      <Band metal={metal} width={width} />
      <Gem color={stone} shape={shape} />
      <Prongs metal={metal} />

      <ambientLight intensity={0.5} />
      <spotLight
        position={[4, 6, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight position={[-4, 4, -4]} intensity={0.8} color="#8ab4e8" />
      <pointLight position={[0, -2, 2]} intensity={0.4} color="#4a90d9" />
    </group>
  );
}

export default function ThreeRing({ config }: { config: Record<string, any> }) {
  return (
    <div className="w-full h-full min-h-[280px] sm:min-h-[350px] md:min-h-[400px] cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 1.2, 3.2], fov: 32 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Scene config={config} />
        <Environment preset="studio" />
        <ContactShadows
          position={[0, -1.3, 0]}
          opacity={0.35}
          scale={8}
          blur={2.5}
          far={4}
        />
        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={5}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.6}
          autoRotate
          autoRotateSpeed={1.2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}