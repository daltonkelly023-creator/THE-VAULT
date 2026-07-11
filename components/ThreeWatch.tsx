"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

function WatchScene({ config }: { config: Record<string, string | number> }) {
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

  const dialColor = useMemo(() => {
    const map: Record<string, [number, number, number]> = {
      white: [0.98, 0.98, 0.96],
      black: [0.06, 0.06, 0.08],
      blue: [0.1, 0.2, 0.45],
      champagne: [0.9, 0.82, 0.6],
      green: [0.1, 0.35, 0.2],
      "mother-of-pearl": [0.95, 0.92, 0.88],
      burgundy: [0.4, 0.08, 0.12],
    };
    return map[config.dialColor as string] || [0.98, 0.98, 0.96];
  }, [config.dialColor]);

  const strapMaterial = useMemo(() => config.strapMaterial as string || "leather", [config.strapMaterial]);
  const strapColor = useMemo(() => {
    const map: Record<string, [number, number, number]> = {
      black: [0.1, 0.1, 0.1],
      brown: [0.4, 0.25, 0.12],
      tan: [0.75, 0.6, 0.4],
      navy: [0.1, 0.15, 0.3],
      green: [0.15, 0.3, 0.15],
      red: [0.5, 0.1, 0.1],
      grey: [0.5, 0.5, 0.5],
      white: [0.9, 0.9, 0.88],
      orange: [0.8, 0.4, 0.1],
    };
    return map[config.strapColor as string] || [0.1, 0.1, 0.1];
  }, [config.strapColor]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const caseRadius = 0.55;
  const caseThickness = 0.12;
  const lugWidth = 0.42;

  return (
    <group ref={groupRef}>
      {/* Watch Case */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[caseRadius, caseRadius, caseThickness, 64]} />
        <meshStandardMaterial
          color={new THREE.Color(metal[0], metal[1], metal[2])}
          metalness={1}
          roughness={0.15}
        />
      </mesh>

      {/* Case bezel (slightly raised rim) */}
      <mesh position={[0, caseThickness / 2 + 0.015, 0]} castShadow>
        <torusGeometry args={[caseRadius - 0.02, 0.025, 16, 64]} />
        <meshStandardMaterial
          color={new THREE.Color(metal[0], metal[1], metal[2])}
          metalness={1}
          roughness={0.1}
        />
      </mesh>

      {/* Dial / Face */}
      <mesh position={[0, caseThickness / 2 + 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[caseRadius - 0.06, 64]} />
        <meshStandardMaterial
          color={new THREE.Color(dialColor[0], dialColor[1], dialColor[2])}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>

      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = caseRadius - 0.14;
        const isMajor = i % 3 === 0;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, caseThickness / 2 + 0.055, Math.sin(angle) * r]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[isMajor ? 0.04 : 0.025, 0.015, isMajor ? 0.08 : 0.05]} />
            <meshStandardMaterial
              color={new THREE.Color(metal[0], metal[1], metal[2])}
              metalness={1}
              roughness={0.1}
            />
          </mesh>
        );
      })}

      {/* Hands */}
      <group position={[0, caseThickness / 2 + 0.06, 0]}>
        {/* Hour hand */}
        <mesh position={[0, 0, -0.08]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.035, 0.012, 0.22]} />
          <meshStandardMaterial color={new THREE.Color(metal[0], metal[1], metal[2])} metalness={1} roughness={0.1} />
        </mesh>
        {/* Minute hand */}
        <mesh position={[0, 0.005, -0.1]} rotation={[0, Math.PI / 6, 0]}>
          <boxGeometry args={[0.025, 0.01, 0.32]} />
          <meshStandardMaterial color={new THREE.Color(metal[0], metal[1], metal[2])} metalness={1} roughness={0.1} />
        </mesh>
        {/* Second hand */}
        <mesh position={[0, 0.01, -0.12]} rotation={[0, Math.PI / 3, 0]}>
          <boxGeometry args={[0.012, 0.008, 0.34]} />
          <meshStandardMaterial color={new THREE.Color(0.7, 0.1, 0.1)} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Center cap */}
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
          <meshStandardMaterial color={new THREE.Color(metal[0], metal[1], metal[2])} metalness={1} roughness={0.1} />
        </mesh>
      </group>

      {/* Crown */}
      <mesh position={[caseRadius + 0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
        <meshStandardMaterial
          color={new THREE.Color(metal[0], metal[1], metal[2])}
          metalness={1}
          roughness={0.15}
        />
      </mesh>
      {/* Crown ridges */}
      <mesh position={[caseRadius + 0.085, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.04, 8]} />
        <meshStandardMaterial
          color={new THREE.Color(metal[0] * 0.9, metal[1] * 0.9, metal[2] * 0.9)}
          metalness={1}
          roughness={0.1}
        />
      </mesh>

      {/* Lugs */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * (caseRadius - 0.05), -0.02, 0.18]} castShadow>
            <boxGeometry args={[0.12, 0.08, 0.18]} />
            <meshStandardMaterial
              color={new THREE.Color(metal[0], metal[1], metal[2])}
              metalness={1}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[side * (caseRadius - 0.05), -0.02, -0.18]} castShadow>
            <boxGeometry args={[0.12, 0.08, 0.18]} />
            <meshStandardMaterial
              color={new THREE.Color(metal[0], metal[1], metal[2])}
              metalness={1}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Strap - Top */}
      <WatchStrap
        position={[0, -0.02, caseRadius + 0.12]}
        rotation={[Math.PI / 2, 0, 0]}
        material={strapMaterial}
        color={strapColor}
        metal={metal}
        length={1.4}
        width={lugWidth}
        isTop
      />

      {/* Strap - Bottom */}
      <WatchStrap
        position={[0, -0.02, -(caseRadius + 0.12)]}
        rotation={[Math.PI / 2, 0, Math.PI]}
        material={strapMaterial}
        color={strapColor}
        metal={metal}
        length={1.4}
        width={lugWidth}
        isTop={false}
      />
    </group>
  );
}

function WatchStrap({
  position,
  rotation,
  material,
  color,
  metal,
  length,
  width,
  isTop,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  material: string;
  color: [number, number, number];
  metal: [number, number, number];
  length: number;
  width: number;
  isTop: boolean;
}) {
  const segments = 14;
  const segLength = length / segments;

  if (material === "metal-bracelet") {
    return (
      <group position={position} rotation={rotation}>
        {Array.from({ length: segments }).map((_, i) => {
          const z = i * segLength + segLength / 2;
          const isLink = i % 2 === 0;
          return (
            <group key={i} position={[0, 0, z]}>
              {/* Link outer */}
              <mesh castShadow>
                <boxGeometry args={[width + 0.04, isLink ? 0.06 : 0.05, segLength - 0.01]} />
                <meshStandardMaterial
                  color={new THREE.Color(metal[0], metal[1], metal[2])}
                  metalness={1}
                  roughness={0.2}
                />
              </mesh>
              {/* Link inner gap simulation */}
              <mesh position={[0, 0.005, 0]}>
                <boxGeometry args={[width - 0.06, 0.04, segLength - 0.03]} />
                <meshStandardMaterial
                  color={new THREE.Color(metal[0] * 0.85, metal[1] * 0.85, metal[2] * 0.85)}
                  metalness={1}
                  roughness={0.15}
                />
              </mesh>
              {/* Pin */}
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.008, 0.008, width + 0.06, 8]} />
                <meshStandardMaterial
                  color={new THREE.Color(metal[0] * 0.7, metal[1] * 0.7, metal[2] * 0.7)}
                  metalness={1}
                  roughness={0.1}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }

  if (material === "alligator" || material === "crocodile") {
    return (
      <group position={position} rotation={rotation}>
        {/* Base strap */}
        <mesh castShadow>
          <boxGeometry args={[width, 0.045, length]} />
          <meshStandardMaterial
            color={new THREE.Color(color[0], color[1], color[2])}
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>
        {/* Alligator scale pattern */}
        {Array.from({ length: segments * 2 }).map((_, row) => {
          const cols = row % 2 === 0 ? 3 : 2;
          return Array.from({ length: cols }).map((_, col) => {
            const z = (row / (segments * 2)) * length + 0.02;
            const xOffset = cols === 3 ? -width / 3 : -width / 4;
            const x = xOffset + (col * (width / (cols === 3 ? 1.4 : 1.2)));
            const scaleW = width / (cols === 3 ? 3.5 : 2.5);
            return (
              <mesh key={`${row}-${col}`} position={[x, 0.025, z]} castShadow>
                <boxGeometry args={[scaleW, 0.012, segLength / 1.8]} />
                <meshStandardMaterial
                  color={new THREE.Color(
                    color[0] * 1.15,
                    color[1] * 1.15,
                    color[2] * 1.15
                  )}
                  metalness={0.05}
                  roughness={0.85}
                />
              </mesh>
            );
          });
        })}
        {/* Stitching lines */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (width / 2 - 0.02), 0.028, length / 2]}>
            <boxGeometry args={[0.008, 0.005, length]} />
            <meshStandardMaterial color={new THREE.Color(0.9, 0.9, 0.85)} metalness={0} roughness={0.9} />
          </mesh>
        ))}
        {/* Buckle (only on bottom strap) */}
        {!isTop && (
          <group position={[0, 0.02, length - 0.15]}>
            <mesh castShadow>
              <boxGeometry args={[width + 0.08, 0.06, 0.2]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[0, 0.04, 0.02]}>
              <boxGeometry args={[width * 0.6, 0.025, 0.08]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={1}
                roughness={0.1}
              />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  if (material === "nato" || material === "fabric") {
    const stripeCount = 8;
    const stripeWidth = length / stripeCount;
    return (
      <group position={position} rotation={rotation}>
        {Array.from({ length: stripeCount }).map((_, i) => {
          const isAccent = i % 2 === 0;
          const z = i * stripeWidth + stripeWidth / 2;
          return (
            <mesh key={i} position={[0, 0, z]} castShadow>
              <boxGeometry args={[width, 0.035, stripeWidth - 0.005]} />
              <meshStandardMaterial
                color={
                  isAccent
                    ? new THREE.Color(color[0], color[1], color[2])
                    : new THREE.Color(color[0] * 0.7, color[1] * 0.7, color[2] * 0.7)
                }
                metalness={0}
                roughness={0.95}
              />
            </mesh>
          );
        })}
        {/* Keepers */}
        {[0.3, 0.5].map((pos, i) => (
          <mesh key={i} position={[0, 0.02, pos * length]}>
            <boxGeometry args={[width + 0.02, 0.04, 0.06]} />
            <meshStandardMaterial
              color={new THREE.Color(color[0] * 0.8, color[1] * 0.8, color[2] * 0.8)}
              metalness={0}
              roughness={0.9}
            />
          </mesh>
        ))}
        {/* Buckle */}
        {!isTop && (
          <group position={[0, 0.02, length - 0.1]}>
            <mesh castShadow>
              <boxGeometry args={[width + 0.06, 0.05, 0.15]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  if (material === "rubber" || material === "silicone") {
    return (
      <group position={position} rotation={rotation}>
        <mesh castShadow>
          <boxGeometry args={[width, 0.04, length]} />
          <meshStandardMaterial
            color={new THREE.Color(color[0], color[1], color[2])}
            metalness={0.05}
            roughness={0.3}
          />
        </mesh>
        {/* Ridges for rubber texture */}
        {Array.from({ length: 20 }).map((_, i) => {
          const z = (i / 20) * length + 0.015;
          return (
            <mesh key={i} position={[0, 0.025, z]}>
              <boxGeometry args={[width - 0.04, 0.008, 0.02]} />
              <meshStandardMaterial
                color={new THREE.Color(color[0] * 0.9, color[1] * 0.9, color[2] * 0.9)}
                metalness={0.05}
                roughness={0.4}
              />
            </mesh>
          );
        })}
        {/* Buckle */}
        {!isTop && (
          <group position={[0, 0.02, length - 0.12]}>
            <mesh castShadow>
              <boxGeometry args={[width + 0.06, 0.05, 0.18]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, 0.04, 0.02]}>
              <boxGeometry args={[width * 0.5, 0.02, 0.06]} />
              <meshStandardMaterial
                color={new THREE.Color(metal[0], metal[1], metal[2])}
                metalness={0.9}
                roughness={0.15}
              />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  // Default leather
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[width, 0.04, length]} />
        <meshStandardMaterial
          color={new THREE.Color(color[0], color[1], color[2])}
          metalness={0.1}
          roughness={0.75}
        />
      </mesh>
      {/* Stitching */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 - 0.025), 0.025, length / 2]}>
          <boxGeometry args={[0.006, 0.004, length]} />
          <meshStandardMaterial color={new THREE.Color(0.85, 0.8, 0.7)} metalness={0} roughness={0.9} />
        </mesh>
      ))}
      {/* Taper effect - slightly narrower at end */}
      <mesh position={[0, 0, length - 0.1]} castShadow>
        <boxGeometry args={[width * 0.85, 0.035, 0.2]} />
        <meshStandardMaterial
          color={new THREE.Color(color[0], color[1], color[2])}
          metalness={0.1}
          roughness={0.75}
        />
      </mesh>
      {/* Buckle */}
      {!isTop && (
        <group position={[0, 0.02, length - 0.12]}>
          <mesh castShadow>
            <boxGeometry args={[width + 0.08, 0.06, 0.18]} />
            <meshStandardMaterial
              color={new THREE.Color(metal[0], metal[1], metal[2])}
              metalness={1}
              roughness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.04, 0.02]}>
            <boxGeometry args={[width * 0.55, 0.025, 0.08]} />
            <meshStandardMaterial
              color={new THREE.Color(metal[0], metal[1], metal[2])}
              metalness={1}
              roughness={0.1}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function ThreeWatch({ config }: { config: Record<string, string | number> }) {
  return (
    <div className="w-full h-64 md:h-80">
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 2.8], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />
        <directionalLight position={[-2, 3, -1]} intensity={0.4} />
        <spotLight position={[0, 3, 0]} intensity={0.5} angle={0.5} penumbra={0.5} />
        <Environment preset="studio" />
        <WatchScene config={config} />
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