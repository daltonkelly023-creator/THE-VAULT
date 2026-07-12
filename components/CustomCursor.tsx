"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";

export type CursorType = "default" | "trail" | "pulse" | "flame" | "spark";

interface CursorConfig {
  type: CursorType;
  color: string;
  size: number;
  trailLength: number;
}

interface TrailDot {
  id: number;
  x: number;
  y: number;
}

interface SparkParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
}

export default function CustomCursor({ config }: { config: CursorConfig }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [sparks, setSparks] = useState<SparkParticle[]>([]);
  const [trail, setTrail] = useState<TrailDot[]>([]);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailIdRef = useRef(0);
  const mousePos = useRef({ x: 0, y: 0 });

  const springConfig = { damping: 30, stiffness: 500 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  // Track mouse
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [cursorX, cursorY]);

  // Trail effect
  useEffect(() => {
    if (config.type !== "trail" && config.type !== "flame") return;

    const interval = setInterval(() => {
      trailIdRef.current += 1;
      setTrail(prev => {
        const newDot = {
          id: trailIdRef.current,
          x: mousePos.current.x,
          y: mousePos.current.y,
        };
        const maxLength = config.trailLength || 5;
        return [...prev.slice(-maxLength + 1), newDot];
      });
    }, 30);

    return () => clearInterval(interval);
  }, [config.type, config.trailLength]);

  // Click effects
  const handleClick = useCallback((e: MouseEvent) => {
    if (config.type === "pulse") {
      const id = Date.now();
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
    }

    if (config.type === "spark") {
      const particles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: e.clientX,
        y: e.clientY,
        angle: (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
        distance: 15 + Math.random() * 25,
      }));
      setSparks(prev => [...prev, ...particles]);
      setTimeout(() => setSparks(prev => prev.filter(s => !particles.find(p => p.id === s.id))), 600);
    }
  }, [config.type]);

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  // Hover detection
  useEffect(() => {
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [data-cursor-hover]")) {
        setIsHovering(true);
      }
    };
    const handleOut = () => setIsHovering(false);

    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    return () => {
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, []);

  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;
  if (isTouchDevice) return null;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      >
        <motion.div
          className="rounded-full"
          style={{ backgroundColor: config.color }}
          animate={{
            width: isHovering ? config.size * 2.5 : isClicking ? config.size * 1.5 : config.size,
            height: isHovering ? config.size * 2.5 : isClicking ? config.size * 1.5 : config.size,
            opacity: isClicking ? 0.6 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </motion.div>

      {/* Trail */}
      {(config.type === "trail" || config.type === "flame") && (
        <>
          {trail.map((dot, i) => (
            <div
              key={dot.id}
              className="fixed pointer-events-none z-[9998] rounded-full"
              style={{
                left: dot.x,
                top: dot.y,
                width: config.size * (1 - (trail.length - 1 - i) / trail.length * 0.7),
                height: config.size * (1 - (trail.length - 1 - i) / trail.length * 0.7),
                backgroundColor: config.type === "flame" 
                  ? `rgba(201, 169, 110, ${0.4 * (1 - (trail.length - 1 - i) / trail.length)})`
                  : `${config.color}${Math.floor(0.3 * (1 - (trail.length - 1 - i) / trail.length) * 255).toString(16).padStart(2, "0")}`,
                transform: "translate(-50%, -50%)",
                filter: config.type === "flame" ? `blur(${i * 0.5}px)` : "none",
                transition: "opacity 0.1s",
              }}
            />
          ))}
        </>
      )}

      {/* Pulse ripples */}
      <AnimatePresence>
        {config.type === "pulse" && ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="fixed pointer-events-none z-[9997] rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              border: `2px solid ${config.color}`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 60, height: 60, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Spark burst */}
      <AnimatePresence>
        {config.type === "spark" && sparks.map(spark => (
          <motion.div
            key={spark.id}
            className="fixed pointer-events-none z-[9997] rounded-full"
            style={{
              left: spark.x,
              top: spark.y,
              width: 3,
              height: 3,
              backgroundColor: config.color,
            }}
            animate={{
              x: Math.cos(spark.angle) * spark.distance,
              y: Math.sin(spark.angle) * spark.distance,
              opacity: [1, 0],
              scale: [1, 0],
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}