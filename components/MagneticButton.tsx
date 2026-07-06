"use client";

import { useRef, useState } from "react";

/**
 * Wraps a button/link and lets it drift a few px toward the cursor on
 * hover, then settle back with an eased spring on leave. Kept subtle on
 * purpose — this is meant to feel like weight, not a gimmick.
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 14,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [settling, setSettling] = useState(false);

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setSettling(false);
    setOffset({ x: px * strength, y: py * strength });
  }

  function handlePointerLeave() {
    setSettling(true);
    setOffset({ x: 0, y: 0 });
  }

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: settling
          ? "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)"
          : "transform 120ms linear",
      }}
    >
      {children}
    </button>
  );
}