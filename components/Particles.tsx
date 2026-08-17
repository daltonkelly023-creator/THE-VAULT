"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
}

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas!.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    function resize() {
      // Size to the viewport (not the full scrollable page). The canvas is
      // position:fixed, so this keeps particles visible in every screen's
      // worth of content instead of spawning once at the bottom of a page
      // that might be thousands of pixels tall and slowly drifting up over
      // several minutes before anyone scrolls far enough to see them.
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createParticle(bottomSeed = true): Particle {
      const isRed = Math.random() < 0.3;
      const color = isRed 
        ? `201, 64, 64`
        : `74, 144, 217`;
      
      // Optionally seed anywhere (for initial spread)
      const y = bottomSeed
        ? canvas!.height + Math.random() * 80
        : Math.random() * canvas!.height;

      return {
        x: Math.random() * canvas!.width,
        y,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.45 + 0.2,
        opacity: bottomSeed ? 0 : Math.random() * 0.28 + 0.05,
        fadeSpeed: Math.random() * 0.002 + 0.0012,
        color,
      };
    }

    function init() {
      particles = [];
      // Seed particles across THE ENTIRE canvas on init (so top of page has them too)
      const targetCount = 60;
      for (let i = 0; i < targetCount; i++) {
        particles.push(createParticle(false));
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const H = canvas!.height;

      particles.forEach((p, i) => {
        p.y -= p.speedY;

        // Fade in as they rise from the bottom 18% region
        if (p.y > H * 0.82) {
          p.opacity += p.fadeSpeed * 2;
        }
        // Gentle fade as they enter the top 15% region
        if (p.y < H * 0.15) {
          const t = Math.max(0, p.y) / (H * 0.15);
          p.opacity = Math.min(p.opacity, 0.18 + t * 0.22);
          if (p.y < 0) p.opacity -= p.fadeSpeed * 4;
        }

        p.opacity = Math.max(0, Math.min(p.opacity, 0.4));

        if (p.opacity <= 0 || p.y < -30) {
          particles[i] = createParticle(true);
          return;
        }

        // Draw a soft bioluminescent glow — outer halo + core
        const r = p.size;
        const halo = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
        halo.addColorStop(0, `rgba(${p.color}, ${Math.min(p.opacity * 1.6, 0.7)})`);
        halo.addColorStop(0.35, `rgba(${p.color}, ${p.opacity * 0.4})`);
        halo.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx!.beginPath();
        ctx!.fillStyle = halo;
        ctx!.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(255,255,255,${Math.min(p.opacity, 0.9)})`;
        ctx!.arc(p.x, p.y, r * 0.45, 0, Math.PI * 2);
        ctx!.fill();
      });

      animationId = requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();

    const onResize = () => {
      resize();
      init();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}