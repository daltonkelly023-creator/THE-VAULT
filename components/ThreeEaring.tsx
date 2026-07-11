"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

function EarringScene({ config }: { config: Record<string, string | number> }) {
  const groupRef = useRef<THREE.Group>(null);

  const metal = useMemo(() => {
    const map: Record<string, [number, number, number]> = {
      "yellow-gold": [0.85, 0.7, 0.3],
      "rose-gold": [0.76, 0.56, 0.48],
      "white-gold": [0.88, 0.88, 0.9],
      platinum: [0.9, 0.9, 0.92],
      silver: [0.75, 0.75, 0.78],
      titanium: [0.55, 0.55, 0.58],
      "black-rhodium": [0.15, 0.15, 0.18],
    };
    return map[config.metal as string] || [0.85, 0.7, 0.3];
  }, [config.metal]);

  const stone = useMemo(() => {
    const map: Record<string, [number, number, number]> = {
      diamond: [0.95, 0.98, 1.0],
      ruby: [0.7, 0.1, 0.15],
      sapphire: [0.1, 0.2, 0.6],
      emerald: [0.1, 0.6, 0.25],
      "black-diamond": [0.15, 0.15, 0.18],
      amethyst: [0.5, 0.2, 0.6],
      aquamarine: [0.5, 0.8, 0.85],
      opal: [0.9, 0.95, 0.95],
      pearl: [0.95, 0.92, 0.88],
      "rose-quartz": [0.95, 0.75, 0.75],
    };
    return map[config.stone as string] || [0.95, 0.98, 1.0];
  }, [config.stone]);

  const backingType = useMemo(() => config.backingType as string || "butterfly", [config.backingType]);
  const earringStyle = useMemo(() => config.earringStyle as string || "stud", [config.earringStyle]);
  const stoneSize = useMemo(() => {
    const s = parseFloat(config.stoneSize as string) || 5;
    return (s / 100) * 1.5;
  }, [config.stoneSize]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main post/stem */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
        <meshStandardMaterial
          color={new THREE.Color(metal[0], metal[1], metal[2])}
          metalness={1}
          roughness={0.15}
        />
      </mesh>

      {/* Front face / Stud */}
      <group position={[0.18, 0, 0]}>
        {earringStyle === "stud" && (
          <>
            {/* Setting basket */}
            <mesh castShadow>
              <cylinderGeometry args={[stoneSize + 0.04, stoneSize + 0.06, 0.08, 6]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Colored stone */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <octahedronGeometry args={[stoneSize, 0]} />
              <meshPhysicalMaterial
                color={new THREE.Color(stone[0], stone[1], stone[2])}
                metalness={0.1}
                roughness={0.05}
                transmission={0.3}
                thickness={0.5}
                clearcoat={1}
                clearcoatRoughness={0.05}
              />
            </mesh>
            {/* Prongs */}
            {Array.from({ length: 4 }).map((_, i) => {
              const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(angle) * (stoneSize * 0.85), 0.04, Math.sin(angle) * (stoneSize * 0.85)]}
                  castShadow
                >
                  <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
                  <meshStandardMaterial
                    color={new THREE.Color(metal[0], metal[1], metal[2])}
                    metalness={1}
                    roughness={0.15}
                  />
                </mesh>
              );
            })}
          </>
        )}

        {earringStyle === "halo" && (
          <>
            {/* Center stone */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <octahedronGeometry args={[stoneSize * 0.85, 0]} />
              <meshPhysicalMaterial
                color={new THREE.Color(stone[0], stone[1], stone[2])}
                metalness={0.1}
                roughness={0.05}
                transmission={0.3}
                thickness={0.5}
                clearcoat={1}
              />
            </mesh>
            {/* Halo ring */}
            <mesh position={[0, 0.03, 0]}>
              <torusGeometry args={[stoneSize + 0.08, 0.02, 8, 24]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Halo stones */}
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i / 10) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(angle) * (stoneSize + 0.08), 0.05, Math.sin(angle) * (stoneSize + 0.08)]}>
                  <sphereGeometry args={[0.02, 8, 8]} />
                  <meshPhysicalMaterial
                    color={new THREE.Color(0.95, 0.98, 1.0)}
                    metalness={0.1}
                    roughness={0.05}
                    clearcoat={1}
                  />
                </mesh>
              );
            })}
          </>
        )}

        {earringStyle === "drop" && (
          <>
            {/* Top connector */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Chain link to drop */}
            <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.04, 0.012, 8, 12]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.2}
              />
            </mesh>
            {/* Drop stone */}
            <mesh position={[0, -0.22, 0]} castShadow>
              <coneGeometry args={[stoneSize * 0.8, stoneSize * 1.6, 8]} />
              <meshPhysicalMaterial
                color={new THREE.Color(stone[0], stone[1], stone[2])}
                metalness={0.1}
                roughness={0.05}
                transmission={0.3}
                thickness={0.5}
                clearcoat={1}
              />
            </mesh>
            {/* Drop cap */}
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[stoneSize * 0.5, stoneSize * 0.6, 0.04, 8]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
          </>
        )}

        {earringStyle === "cluster" && (
          <>
            {/* Center large stone */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <octahedronGeometry args={[stoneSize, 0]} />
              <meshPhysicalMaterial
                color={new THREE.Color(stone[0], stone[1], stone[2])}
                metalness={0.1}
                roughness={0.05}
                transmission={0.3}
                thickness={0.5}
                clearcoat={1}
              />
            </mesh>
            {/* Surrounding small stones */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(angle) * 0.12, 0.04, Math.sin(angle) * 0.12]}>
                  <sphereGeometry args={[0.035, 8, 8]} />
                  <meshPhysicalMaterial
                    color={new THREE.Color(stone[0] * 0.9, stone[1] * 0.9, stone[2] * 0.9)}
                    metalness={0.1}
                    roughness={0.05}
                    clearcoat={1}
                  />
                </mesh>
              );
            })}
          </>
        )}
      </group>

      {/* Backing / Closure */}
      <group position={[-0.18, 0, 0]}>
        {backingType === "butterfly" && (
          <>
            {/* Butterfly disc */}
            <mesh castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Wings */}
            {Array.from({ length: 2 }).map((_, i) => (
              <mesh key={i} position={[0, 0, i === 0 ? 0.08 : -0.08]} rotation={[i === 0 ? -0.3 : 0.3, 0, 0]}>
                <boxGeometry args={[0.1, 0.02, 0.08]} />
                <meshStandardMaterial
                  color={new THREE.Color(metal[0], metal[1], metal[2])}
                  metalness={1}
                  roughness={0.15}
                />
              </mesh>
            ))}
          </>
        )}

        {backingType === "push" && (
          <>
            {/* Push back - flat disc with friction */}
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Grip ridges */}
            {Array.from({ length: 3 }).map((_, i) => (
              <mesh key={i} position={[0, 0, (i - 1) * 0.04]}>
                <torusGeometry args={[0.1, 0.008, 8, 24]} />
                <meshStandardMaterial
                  color={new THREE.Color(metal[0] * 0.9, metal[1] * 0.9, metal[2] * 0.9)}
                  metalness={1}
                  roughness={0.1}
                />
              </mesh>
            ))}
          </>
        )}

        {backingType === "screw" && (
          <>
            {/* Screw back - threaded cylinder */}
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Thread ridges */}
            {Array.from({ length: 4 }).map((_, i) => (
              <mesh key={i} position={[0, (i - 1.5) * 0.015, 0]}>
                <torusGeometry args={[0.1, 0.006, 8, 24]} />
                <meshStandardMaterial
                  color={new THREE.Color(metal[0] * 0.85, metal[1] * 0.85, metal[2] * 0.85)}
                  metalness={1}
                  roughness={0.1}
                />
              </mesh>
            ))}
            {/* Flat end */}
            <mesh position={[-0.05, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
          </>
        )}

        {backingType === "leverback" && (
          <>
            {/* Leverback hook */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Lever */}
            <mesh position={[-0.05, -0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.08, 0.02, 0.02]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0] * 0.9, metal[1] * 0.9, metal[2] * 0.9)}
                metalness={1}
                roughness={0.1}
              />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

export default function ThreeEarring({ config }: { config: Record<string, string | number> }) {
  return (
    <div className="w-full h-64 md:h-80">
      <Canvas
        shadows
        camera={{ position: [1.5, 0.5, 1.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />
        <directionalLight position={[-2, 3, -1]} intensity={0.4} />
        <spotLight position={[0, 3, 0]} intensity={0.5} angle={0.5} penumbra={0.5} />
        <Environment preset="studio" />
        <EarringScene config={config} />
        <OrbitControls
          enablePan={false}
          minDistance={1.2}
          maxDistance={4}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}