"use client";

import { useEffect, useRef } from "react";
import { AtmosphereOption } from "@/lib/ringData";

interface EmberFieldProps {
  atmosphere: AtmosphereOption;
  collection?: "atelier" | "terra"; // Add collection prop for physics/color mapping
}

const DENSITY_BY_ATMOSPHERE: Record<string, number> = {
  studio: 16,
  boudoir: 28,
  vault: 40,
  quarry: 14,
  dawn: 24,
  dusk: 32,
};

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  flicker: number;
}

export default function EmberField({ atmosphere, collection = "atelier" }: EmberFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;
    let particles: Particle[] = [];

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * window.devicePixelRatio;
      canvas!.height = rect.height * window.devicePixelRatio;
      ctx!.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }

    function makeParticles() {
      const rect = canvas!.getBoundingClientRect();
      const count = DENSITY_BY_ATMOSPHERE[atmosphere.id] ?? 24;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: 0.6 + Math.random() * 1.6,
        speed: 0.05 + Math.random() * 0.12,
        drift: (Math.random() - 0.5) * 0.06,
        phase: Math.random() * Math.PI * 2,
        flicker: 0.5 + Math.random() * 0.5,
      }));
    }

    resize();
    makeParticles();
    window.addEventListener("resize", resize);

    function draw(t: number) {
      const rect = canvas!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);

      for (const p of particles) {
        // --- Physics Swap ---
        if (collection === "terra") {
          p.y += p.speed; // Dust falls heavily down
        } else {
          p.y -= p.speed; // Bioluminescence floats up
        }
        
        p.x += p.drift;

        // --- Bounds Handling ---
        if (collection === "terra" && p.y > rect.height + 5) {
          p.y = -5;
          p.x = Math.random() * rect.width;
        } else if (collection === "atelier" && p.y < -5) {
          p.y = rect.height + 5;
          p.x = Math.random() * rect.width;
        }

        if (p.x < -5) p.x = rect.width + 5;
        if (p.x > rect.width + 5) p.x = -5;

        const flick = 0.3 + 0.3 * Math.sin(t * 0.001 * p.flicker + p.phase);
        
        // --- Color Swap ---
        // Earthy bronze for Terra, classic gold for Atelier
        const color = collection === "terra" 
          ? `rgba(185, 155, 114, ${flick.toFixed(3)})` 
          : `rgba(197, 168, 128, ${flick.toFixed(3)})`;

        ctx!.beginPath();
        ctx!.fillStyle = color;
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      frameId = requestAnimationFrame(draw);
    }
    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [atmosphere.id, collection]); // Ensure effect re-runs when collection changes

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: "screen",
        zIndex: 2,
        transition: "opacity 700ms ease"
      }}
    />
  );
}