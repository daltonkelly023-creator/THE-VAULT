// components/Particles.tsx
"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
}

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      canvas!.width = parent.clientWidth;
      canvas!.height = parent.clientHeight;
    }

    function createParticle(): Particle {
      const parent = canvas!.parentElement;
      const h = parent ? parent.clientHeight : canvas!.height;
      const w = parent ? parent.clientWidth : canvas!.width;
      return {
        x: Math.random() * w,
        y: h + 10,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        fadeSpeed: Math.random() * 0.002 + 0.001,
      };
    }

    function init() {
      particles = [];
      for (let i = 0; i < 60; i++) {
        const p = createParticle();
        const parent = canvas!.parentElement;
        p.y = Math.random() * (parent ? parent.clientHeight : canvas!.height);
        particles.push(p);
      }
    }

    function animate() {
      const parent = canvas!.parentElement;
      const w = parent ? parent.clientWidth : canvas!.width;
      const h = parent ? parent.clientHeight : canvas!.height;
      
      ctx!.clearRect(0, 0, w, h);

      particles.forEach((p, i) => {
        p.y -= p.speedY;
        p.opacity -= p.fadeSpeed;

        if (p.opacity <= 0 || p.y < -10) {
          particles[i] = createParticle();
          return;
        }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(197, 168, 128, ${p.opacity})`;
        ctx!.fill();
      });

      animationId = requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}