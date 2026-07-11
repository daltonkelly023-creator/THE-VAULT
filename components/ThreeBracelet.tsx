"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

function BraceletScene({ config }: { config: Record<string, string | number> }) {
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

  const closureType = useMemo(() => config.closureType as string || "lobster", [config.closureType]);
  const braceletStyle = useMemo(() => config.braceletStyle as string || "cuff", [config.braceletStyle]);
  const width = useMemo(() => {
    const w = parseFloat(config.width as string) || 8;
    return (w / 100) * 1.2; // Scale to 3D units
  }, [config.width]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  const bandRadius = 0.65;
  const bandThickness = 0.06;
  const gap = 0.35; // Opening for wrist

  return (
    <group ref={groupRef}>
      {/* Main band - curved cuff */}
      {braceletStyle === "cuff" && (
        <>
          {/* Band body */}
          <mesh castShadow rotation={[0, 0, 0]}>
            <torusGeometry args={[bandRadius, width / 2, 16, 48, Math.PI * 2 - 0.6]} />
            <meshStandardMaterial
              color={new THREE.Color(metal[0], metal[1], metal[2])}
              metalness={1}
              roughness={0.2}
            />
          </mesh>

          {/* Center stone setting */}
          <group position={[0, bandRadius + width / 2 + 0.04, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.12, 0.14, 0.05, 6]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[0, 0.06, 0]} castShadow>
              <octahedronGeometry args={[0.12, 0]} />
              <meshPhysicalMaterial
                color={new THREE.Color(stone[0], stone[1], stone[2])}
                metalness={0.1}
                roughness={0.05}
                transmission={0.3}
                thickness={0.5}
                clearcoat={1}
              />
            </mesh>
            {/* Prongs */}
            {Array.from({ length: 4 }).map((_, i) => {
              const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
              return (
                <mesh key={i} position={[Math.cos(angle) * 0.09, 0.04, Math.sin(angle) * 0.09]} castShadow>
                  <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
                  <meshStandardMaterial
                    color={new THREE.Color(metal[0], metal[1], metal[2])}
                    metalness={1}
                    roughness={0.15}
                  />
                </mesh>
              );
            })}
          </group>
        </>
      )}

      {braceletStyle === "tennis" && (
        <>
          {/* Tennis bracelet - continuous stones */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            if (Math.abs(angle - Math.PI) < 0.5) return null; // Skip gap area
            return (
              <group key={i} position={[Math.cos(angle) * bandRadius, Math.sin(angle) * bandRadius, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.08, 0.08, width]} />
                  <meshStandardMaterial
                    color={new THREE.Color(metal[0], metal[1], metal[2])}
                    metalness={1}
                    roughness={0.15}
                  />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <sphereGeometry args={[0.04, 8, 8]} />
                  <meshPhysicalMaterial
                    color={new THREE.Color(stone[0], stone[1], stone[2])}
                    metalness={0.1}
                    roughness={0.05}
                    clearcoat={1}
                  />
                </mesh>
              </group>
            );
          })}
        </>
      )}

      {braceletStyle === "bangle" && (
        <>
          <mesh castShadow>
            <torusGeometry args={[bandRadius, width / 2, 16, 64]} />
            <meshStandardMaterial
              color={new THREE.Color(metal[0], metal[1], metal[2])}
              metalness={1}
              roughness={0.15}
            />
          </mesh>
          {/* Decorative pattern on bangle */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * bandRadius, Math.sin(angle) * bandRadius, 0]} castShadow>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshPhysicalMaterial
                  color={new THREE.Color(stone[0], stone[1], stone[2])}
                  metalness={0.1}
                  roughness={0.05}
                  clearcoat={1}
                />
              </mesh>
            );
          })}
        </>
      )}

      {braceletStyle === "chain" && (
        <>
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            if (Math.abs(angle - Math.PI) < 0.4) return null;
            const pos = new THREE.Vector3(Math.cos(angle) * bandRadius, Math.sin(angle) * bandRadius, 0);
            const nextAngle = ((i + 1) / 20) * Math.PI * 2;
            const nextPos = new THREE.Vector3(Math.cos(nextAngle) * bandRadius, Math.sin(nextAngle) * bandRadius, 0);
            const mid = pos.clone().add(nextPos).multiplyScalar(0.5);
            const tangent = nextPos.clone().sub(pos).normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
            return (
              <mesh key={i} position={mid} quaternion={quaternion} castShadow>
                <torusGeometry args={[0.06, 0.02, 8, 12]} />
                <meshStandardMaterial
                  color={new THREE.Color(metal[0], metal[1], metal[2])}
                  metalness={1}
                  roughness={0.2}
                />
              </mesh>
            );
          })}
        </>
      )}

      {/* Closure - positioned at the gap */}
      <group position={[0, -bandRadius - 0.1, 0]}>
        {closureType === "lobster" && (
          <>
            {/* Lobster claw shape */}
            <mesh position={[-0.12, 0, 0]} castShadow>
              <boxGeometry args={[0.15, 0.08, 0.06]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[0.12, 0, 0]} castShadow>
              <boxGeometry args={[0.12, 0.06, 0.05]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Spring mechanism */}
            <mesh position={[-0.05, 0.05, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.06, 8]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0] * 0.8, metal[1] * 0.8, metal[2] * 0.8)}
                metalness={1}
                roughness={0.1}
              />
            </mesh>
          </>
        )}

        {closureType === "magnetic" && (
          <>
            {/* Two flat magnetic discs */}
            <mesh position={[-0.1, 0, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[0.1, 0, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Magnetic indicator line */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.005, 0.005]} />
              <meshStandardMaterial color={new THREE.Color(0.3, 0.3, 0.3)} metalness={0.5} roughness={0.5} />
            </mesh>
          </>
        )}

        {closureType === "toggle" && (
          <>
            {/* Ring side */}
            <mesh position={[-0.12, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.08, 0.02, 8, 16]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Bar side */}
            <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Bar end caps */}
            {[-1, 1].map((side) => (
              <mesh key={side} position={[0.12, side * 0.09, 0]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial
                  color={new THREE.Color(metal[0], metal[1], metal[2])}
                  metalness={1}
                  roughness={0.15}
                />
              </mesh>
            ))}
          </>
        )}

        {closureType === "box" && (
          <>
            {/* Box clasp - rectangular push mechanism */}
            <mesh position={[-0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.18, 0.1, 0.08]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.14, 0.08, 0.06]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Push tab */}
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.04, 0.02, 0.04]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0] * 0.8, metal[1] * 0.8, metal[2] * 0.8)}
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

export default function ThreeBracelet({ config }: { config: Record<string, string | number> }) {
  return (
    <div className="w-full h-64 md:h-80">
      <Canvas
        shadows
        camera={{ position: [0, 1.2, 2.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />
        <directionalLight position={[-2, 3, -1]} intensity={0.4} />
        <spotLight position={[0, 3, 0]} intensity={0.5} angle={0.5} penumbra={0.5} />
        <Environment preset="studio" />
        <BraceletScene config={config} />
        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}