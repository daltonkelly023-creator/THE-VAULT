"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

function NecklaceScene({ config }: { config: Record<string, string | number> }) {
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

  const chainStyle = useMemo(() => config.chainStyle as string || "cable", [config.chainStyle]);
  const pendantShape = useMemo(() => config.pendantShape as string || "solitaire", [config.pendantShape]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  const chainPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2;
      // Figure-8 / draped necklace shape
      const x = Math.cos(angle) * 0.9;
      const y = Math.sin(angle * 2) * 0.15 + 0.1;
      const z = Math.sin(angle) * 0.5;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, []);

  const chainCurve = useMemo(() => new THREE.CatmullRomCurve3(chainPoints), [chainPoints]);

  return (
    <group ref={groupRef}>
      {/* Chain */}
      {chainStyle === "cable" && (
        <mesh castShadow>
          <tubeGeometry args={[chainCurve, 64, 0.018, 8, true]} />
          <meshStandardMaterial
            color={new THREE.Color(metal[0], metal[1], metal[2])}
            metalness={1}
            roughness={0.2}
          />
        </mesh>
      )}

      {chainStyle === "box" && (
        <>
          {Array.from({ length: 60 }).map((_, i) => {
            const t = i / 60;
            const pos = chainCurve.getPoint(t);
            const tangent = chainCurve.getTangent(t);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
            return (
              <mesh key={i} position={pos} quaternion={quaternion} castShadow>
                <boxGeometry args={[0.035, 0.035, 0.06]} />
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

      {chainStyle === "rope" && (
        <>
          {Array.from({ length: 50 }).map((_, i) => {
            const t = i / 50;
            const pos = chainCurve.getPoint(t);
            const tangent = chainCurve.getTangent(t);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
            return (
              <group key={i} position={pos} quaternion={quaternion}>
                <mesh castShadow>
                  <torusGeometry args={[0.025, 0.012, 8, 12]} />
                  <meshStandardMaterial
                    color={new THREE.Color(metal[0], metal[1], metal[2])}
                    metalness={1}
                    roughness={0.2}
                  />
                </mesh>
              </group>
            );
          })}
        </>
      )}

      {chainStyle === "snake" && (
        <mesh castShadow>
          <tubeGeometry args={[chainCurve, 64, 0.025, 12, true]} />
          <meshStandardMaterial
            color={new THREE.Color(metal[0], metal[1], metal[2])}
            metalness={1}
            roughness={0.15}
          />
        </mesh>
      )}

      {/* Clasp at the back top */}
      <mesh position={[0, 0.35, -0.85]} castShadow>
        <boxGeometry args={[0.12, 0.06, 0.18]} />
        <meshStandardMaterial
          color={new THREE.Color(metal[0], metal[1], metal[2])}
          metalness={1}
          roughness={0.15}
        />
      </mesh>
      <mesh position={[0, 0.38, -0.85]}>
        <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
        <meshStandardMaterial
          color={new THREE.Color(metal[0], metal[1], metal[2])}
          metalness={1}
          roughness={0.1}
        />
      </mesh>

      {/* Pendant at bottom center */}
      <group position={[0, -0.15, 0]}>
        {/* Bail (loop connecting pendant to chain) */}
        <mesh position={[0, 0.18, 0]}>
          <torusGeometry args={[0.06, 0.015, 8, 16]} />
          <meshStandardMaterial
            color={new THREE.Color(metal[0], metal[1], metal[2])}
            metalness={1}
            roughness={0.15}
          />
        </mesh>

        {pendantShape === "solitaire" && (
          <>
            {/* Setting */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.14, 0.06, 6]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Stone */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <octahedronGeometry args={[0.14, 0]} />
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
                <mesh key={i} position={[Math.cos(angle) * 0.1, 0.04, Math.sin(angle) * 0.1]} castShadow>
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

        {pendantShape === "halo" && (
          <>
            {/* Center stone */}
            <mesh position={[0, 0.05, 0]} castShadow>
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
            {/* Halo ring */}
            <mesh position={[0, 0.02, 0]}>
              <torusGeometry args={[0.18, 0.02, 8, 24]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Halo stones */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(angle) * 0.18, 0.04, Math.sin(angle) * 0.18]}>
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

        {pendantShape === "drop" && (
          <>
            {/* Teardrop setting */}
            <mesh position={[0, -0.05, 0]} castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[0, 0.08, 0]} castShadow>
              <coneGeometry args={[0.08, 0.18, 16]} />
              <meshPhysicalMaterial
                color={new THREE.Color(stone[0], stone[1], stone[2])}
                metalness={0.1}
                roughness={0.05}
                transmission={0.3}
                thickness={0.5}
                clearcoat={1}
              />
            </mesh>
          </>
        )}

        {pendantShape === "locket" && (
          <>
            {/* Locket body */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.16, 0.04, 32]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            {/* Locket rim */}
            <mesh position={[0, 0.025, 0]}>
              <torusGeometry args={[0.16, 0.015, 8, 32]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.1}
              />
            </mesh>
            {/* Center gem on locket */}
            <mesh position={[0, 0.035, 0]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshPhysicalMaterial
                color={new THREE.Color(stone[0], stone[1], stone[2])}
                metalness={0.1}
                roughness={0.05}
                clearcoat={1}
              />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

export default function ThreeNecklace({ config }: { config: Record<string, string | number> }) {
  return (
    <div className="w-full h-64 md:h-80">
      <Canvas
        shadows
        camera={{ position: [0, 0.5, 2.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />
        <directionalLight position={[-2, 3, -1]} intensity={0.4} />
        <spotLight position={[0, 3, 0]} intensity={0.5} angle={0.5} penumbra={0.5} />
        <Environment preset="studio" />
        <NecklaceScene config={config} />
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