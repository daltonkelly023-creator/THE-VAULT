"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
  color: string; // blue or red
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
      canvas!.width = canvas!.parentElement?.clientWidth || window.innerWidth;
      canvas!.height = canvas!.parentElement?.clientHeight || window.innerHeight;
    }

    function createParticle(): Particle {
      // 70% blue, 30% red (like showroom bioluminescence)
      const isRed = Math.random() < 0.3;
      const color = isRed 
        ? `201, 64, 64`   // red bioluminescence
        : `74, 144, 217`; // ocean blue
      
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + Math.random() * 100, // Start below parent
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.5 + 0.2,
        opacity: 0,
        fadeSpeed: Math.random() * 0.002 + 0.001,
        color,
      };
    }

    function init() {
      particles = [];
      // Fewer particles for hero: 30 instead of 60
      for (let i = 0; i < 30; i++) {
        const p = createParticle();
        p.y = canvas!.height + Math.random() * 200;
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
        ctx!.fillStyle = `rgba(${p.color}, ${Math.min(p.opacity, 0.4)})`;
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