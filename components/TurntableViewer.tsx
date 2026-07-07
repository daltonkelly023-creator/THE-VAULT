"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

interface TurntableViewerProps {
  frameUrls: string[];
  alt: string;
}

/** Drag-to-spin viewer over a pre-rendered photo sequence. Horizontal drag
 *  distance maps to frame index; a full-width drag walks the whole set once,
 *  matching the "static thumbnail → full experience on click" pattern from
 *  the Aston Martin reference (§3 of the handoff doc), just photo-based
 *  instead of live 3D. */
export default function TurntableViewer({ frameUrls, alt }: TurntableViewerProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const dragState = useRef<{ startX: number; startFrame: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const frameCount = frameUrls.length;

  const framesPerFullDrag = 2.5; // how many container-widths = one full spin

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = { startX: e.clientX, startFrame: frameIndex };
    },
    [frameIndex]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current || !containerRef.current || frameCount === 0) return;
      const width = containerRef.current.getBoundingClientRect().width;
      const dx = e.clientX - dragState.current.startX;
      const deltaFrames = Math.round((dx / width) * framesPerFullDrag * frameCount);
      let next = (dragState.current.startFrame + deltaFrames) % frameCount;
      if (next < 0) next += frameCount;
      setFrameIndex(next);
    },
    [frameCount]
  );

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  if (frameCount === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-grab select-none active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      role="img"
      aria-label={`${alt}, drag to rotate`}
    >
      <Image
        src={frameUrls[frameIndex]}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="pointer-events-none object-contain"
        priority
        draggable={false}
      />
      <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium uppercase tracking-[0.3em] text-zinc-600">
        Drag to rotate
      </span>
    </div>
  );
}
