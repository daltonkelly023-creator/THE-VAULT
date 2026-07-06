"use client";

import { useRef, useState } from "react";
import { MetalOption, CutOption, SettingOption, AtmosphereOption } from "@/lib/ringData";

interface RingCanvasProps {
  metal: MetalOption;
  cut: CutOption;
  setting: SettingOption;
  atmosphere: AtmosphereOption;
  /** Terra mode: renders a horizon/ground background instead of a placeless glow. */
  ground?: boolean;
}

const CENTER_X = 240;
const BAND_CY = 320;

function StoneShape({
  cutId,
  scale,
  gradientId,
}: {
  cutId: CutOption["id"];
  scale: number;
  gradientId: string;
}) {
  const s = scale;
  switch (cutId) {
    case "round":
      return <circle r={34 * s} fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />;
    case "oval":
      return (
        <ellipse rx={26 * s} ry={36 * s} fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
      );
    case "princess":
      return (
        <rect
          x={-28 * s}
          y={-28 * s}
          width={56 * s}
          height={56 * s}
          fill={`url(#${gradientId})`}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1}
        />
      );
    case "emerald":
      return (
        <polygon
          points={[
            [-16 * s, -32 * s],
            [16 * s, -32 * s],
            [30 * s, -18 * s],
            [30 * s, 18 * s],
            [16 * s, 32 * s],
            [-16 * s, 32 * s],
            [-30 * s, 18 * s],
            [-30 * s, -18 * s],
          ]
            .map((p) => p.join(","))
            .join(" ")}
          fill={`url(#${gradientId})`}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1}
        />
      );
  }
}

function FacetLines({ cutId, scale }: { cutId: CutOption["id"]; scale: number }) {
  const s = scale;
  const lines =
    cutId === "round"
      ? [
          [0, -30 * s, 0, 30 * s],
          [-26 * s, -15 * s, 26 * s, 15 * s],
          [-26 * s, 15 * s, 26 * s, -15 * s],
        ]
      : [
          [0, -26 * s, 0, 26 * s],
          [-18 * s, -10 * s, 18 * s, 10 * s],
        ];
  return (
    <g stroke="rgba(255,255,255,0.28)" strokeWidth={0.75}>
      {lines.map((l, i) => (
        <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
      ))}
    </g>
  );
}

function ProngSet({ scale }: { scale: number }) {
  const s = scale;
  const positions: [number, number][] = [
    [-24 * s, -18 * s],
    [24 * s, -18 * s],
    [-24 * s, 20 * s],
    [24 * s, 20 * s],
  ];
  return (
    <g fill="var(--prong-fill, #ddd)">
      {positions.map(([x, y], i) => (
        <path key={i} d={`M ${x} ${y} L ${x - 4} ${y + 26} L ${x + 4} ${y + 26} Z`} opacity={0.85} />
      ))}
    </g>
  );
}

function HaloRing({ scale }: { scale: number }) {
  const s = scale;
  const count = 14;
  const radius = 44 * s;
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.72;
        return <circle key={i} cx={x} cy={y} r={3.2 * s} fill="url(#haloGradient)" />;
      })}
    </g>
  );
}

function PaveDots({ metalId }: { metalId: string }) {
  const dots = Array.from({ length: 13 });
  return (
    <g>
      {dots.map((_, i) => {
        const t = i / (dots.length - 1);
        const angle = Math.PI * 0.18 + t * Math.PI * 0.64;
        const x = CENTER_X + Math.cos(angle + Math.PI) * -128;
        const y = BAND_CY + Math.sin(angle) * 40 - 4;
        return <circle key={i} cx={x} cy={y} r={2.6} fill="url(#paveGradient)" />;
      })}
    </g>
  );
}

export default function RingCanvas({ metal, cut, setting, atmosphere, ground = false }: RingCanvasProps) {
  const [hi, mid, lo] = metal.gradientStops;
  const stoneScale = 0.62 + (2.05 - cut.carat) * -0.02; // subtle size relationship to carat

  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [settling, setSettling] = useState(false);
  const MAX_TILT = 10; // degrees

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setSettling(false);
    setTilt({ x: (0.5 - py) * MAX_TILT * 2, y: (px - 0.5) * MAX_TILT * 2 });
  }

  function handlePointerLeave() {
    setSettling(true);
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      ref={stageRef}
      className="ring-canvas"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: "900px" }}
    >
      <svg
        viewBox="0 0 480 480"
        width="100%"
        height="100%"
        role="img"
        aria-label={`${metal.label} ring, ${cut.label} cut, ${setting.label} setting`}
        style={{
          display: "block",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: settling ? "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)" : "transform 90ms linear",
        }}
      >
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="38%" r="65%">
            <stop offset="0%" stopColor={atmosphere.backgroundFrom} />
            <stop offset="100%" stopColor={atmosphere.backgroundTo} />
          </radialGradient>

          {/* Terra: a horizon instead of a placeless glow — the stone rests on ground, not in a void */}
          <linearGradient id="groundGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={atmosphere.backgroundFrom} />
            <stop offset="62%" stopColor={atmosphere.backgroundFrom} />
            <stop offset="63%" stopColor={atmosphere.backgroundTo} />
            <stop offset="100%" stopColor={atmosphere.backgroundTo} />
          </linearGradient>

          <linearGradient id="bandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hi} />
            <stop offset="55%" stopColor={mid} />
            <stop offset="100%" stopColor={lo} />
          </linearGradient>

          <radialGradient id="stoneGradient" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#DCEEF2" />
            <stop offset="100%" stopColor="#9FC4CC" />
          </radialGradient>

          <radialGradient id="haloGradient" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#BFD8DC" />
          </radialGradient>

          <radialGradient id="paveGradient" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#B8CDD1" />
          </radialGradient>

          <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
        </defs>

        {/* atmosphere background */}
        <rect
          x="0"
          y="0"
          width="480"
          height="480"
          fill={ground ? "url(#groundGlow)" : "url(#bgGlow)"}
          style={{ transition: "fill 700ms ease" }}
        />

        {/* Terra: faint sediment line at the horizon */}
        {ground && (
          <rect x="0" y="302" width="480" height="1" fill={atmosphere.blendColor} opacity={0.25} />
        )}

        {/* grounding shadow */}
        <ellipse cx={CENTER_X} cy={392} rx={118} ry={20} fill="#000000" opacity={0.45} filter="url(#softShadow)" />

        {/* band (torus via evenodd) */}
        <path
          d={`
            M ${CENTER_X - 132} ${BAND_CY}
            A 132 50 0 1 0 ${CENTER_X + 132} ${BAND_CY}
            A 132 50 0 1 0 ${CENTER_X - 132} ${BAND_CY}
            Z
            M ${CENTER_X - 100} ${BAND_CY}
            A 100 32 0 1 0 ${CENTER_X + 100} ${BAND_CY}
            A 100 32 0 1 0 ${CENTER_X - 100} ${BAND_CY}
            Z
          `}
          fill="url(#bandGradient)"
          fillRule="evenodd"
          style={{ transition: "fill 500ms ease" }}
        />
        {/* band top highlight */}
        <path
          d={`M ${CENTER_X - 120} ${BAND_CY - 6} A 120 40 0 0 1 ${CENTER_X + 120} ${BAND_CY - 6}`}
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.5}
          opacity={0.5}
        />

        {setting.id === "pave" && <PaveDots metalId={metal.id} />}

        {/* stone assembly, seated into the band's top surface */}
        <g transform={`translate(${CENTER_X}, 278)`}>
          {setting.id === "halo" && <HaloRing scale={stoneScale} />}

          {setting.id === "three-stone" && (
            <>
              <g transform={`translate(${-58 * stoneScale}, 14) scale(0.55)`}>
                <StoneShape cutId={cut.id} scale={stoneScale} gradientId="stoneGradient" />
              </g>
              <g transform={`translate(${58 * stoneScale}, 14) scale(0.55)`}>
                <StoneShape cutId={cut.id} scale={stoneScale} gradientId="stoneGradient" />
              </g>
            </>
          )}

          <StoneShape cutId={cut.id} scale={stoneScale} gradientId="stoneGradient" />
          <FacetLines cutId={cut.id} scale={stoneScale} />
          <ProngSet scale={stoneScale} />

          {/* shimmer highlight, screened on top, kept small and centered on the stone */}
          <ellipse
            className="stone-shimmer"
            cx={-6}
            cy={-8}
            rx={6}
            ry={3}
            fill="#FFFFFF"
            style={{ mixBlendMode: "screen" }}
          />
        </g>

        {/* full-scene atmosphere tint */}
        <rect
          x="0"
          y="0"
          width="480"
          height="480"
          fill={atmosphere.blendColor}
          opacity={0.5}
          style={{ mixBlendMode: atmosphere.blendMode, transition: "fill 700ms ease" }}
        />
      </svg>
    </div>
  );
}