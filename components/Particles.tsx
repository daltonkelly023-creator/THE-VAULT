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

    const ctx = canvas!.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createParticle(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + Math.random() * 50, // Start below screen
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.5 + 0.2,
        opacity: 0,
        fadeSpeed: Math.random() * 0.002 + 0.001,
      };
    }

    function init() {
      particles = [];
      for (let i = 0; i < 60; i++) {
        const p = createParticle();
        // Spread them vertically so they don't all appear at once
        p.y = canvas!.height + Math.random() * 300;
        p.opacity = Math.random() * 0.3;
        particles.push(p);
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      particles.forEach((p, i) => {
        p.y -= p.speedY;

        // Fade in as they rise from bottom, fade out as they reach top
        if (p.y > canvas!.height - 100) {
          p.opacity += p.fadeSpeed * 2;
        } else if (p.y < 100) {
          p.opacity -= p.fadeSpeed * 3;
        }

        if (p.opacity <= 0 || p.y < -20) {
          particles[i] = createParticle();
          return;
        }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(197, 168, 128, ${Math.min(p.opacity, 0.4)})`;
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
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}