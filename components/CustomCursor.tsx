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
  size: number;
}

export default function CustomCursor({ config }: { config: CursorConfig }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [sparks, setSparks] = useState<SparkParticle[]>([]);
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const trailIdRef = useRef(0);
  const mousePos = useRef({ x: -100, y: -100 });

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  // Track mouse
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);
    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, [cursorX, cursorY, isVisible]);

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
        const maxLength = config.trailLength || 8;
        return [...prev.slice(-maxLength + 1), newDot];
      });
    }, 25);

    return () => clearInterval(interval);
  }, [config.type, config.trailLength]);

  // Click effects
  const handleClick = useCallback((e: MouseEvent) => {
    if (config.type === "pulse" || config.type === "default") {
      const id = Date.now();
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);
    }

    if (config.type === "spark" || config.type === "flame") {
      const count = config.type === "flame" ? 12 : 10;
      const particles = Array.from({ length: count }).map((_, i) => ({
        id: Date.now() + i,
        x: e.clientX,
        y: e.clientY,
        angle: (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8,
        distance: 20 + Math.random() * 40,
        size: 2 + Math.random() * 3,
      }));
      setSparks(prev => [...prev, ...particles]);
      setTimeout(() => setSparks(prev => prev.filter(s => !particles.find(p => p.id === s.id))), 700);
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
      if (target.closest("a, button, [data-cursor-hover], input, textarea, select")) {
        setIsHovering(true);
      }
    };
    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [data-cursor-hover], input, textarea, select")) {
        setIsHovering(false);
      }
    };

    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    return () => {
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, []);

  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;
  if (isTouchDevice) return null;

  const currentSize = isHovering ? config.size * 2.2 : isClicking ? config.size * 0.8 : config.size;

  return (
    <>
      {/* Main cursor — premium ring with glow */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: cursorX,
          y: cursorY,
          opacity: isVisible ? 1 : 0,
        }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            backgroundColor: config.color,
            left: "50%",
            top: "50%",
            translateX: "-50%",
            translateY: "-50%",
            boxShadow: `0 0 ${currentSize * 1.5}px ${currentSize * 0.5}px ${config.color}40, 0 0 ${currentSize * 3}px ${currentSize * 0.3}px ${config.color}20`,
          }}
          animate={{
            width: currentSize,
            height: currentSize,
            opacity: isClicking ? 0.7 : 0.9,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        />

        {/* Inner core */}
        <motion.div
          className="absolute rounded-full"
          style={{
            backgroundColor: "#fff",
            left: "50%",
            top: "50%",
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            width: currentSize * 0.4,
            height: currentSize * 0.4,
            opacity: isClicking ? 0.5 : 0.8,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        />

        {/* Ring border */}
        <motion.div
          className="absolute rounded-full border"
          style={{
            borderColor: config.color,
            left: "50%",
            top: "50%",
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            width: currentSize * 1.6,
            height: currentSize * 1.6,
            opacity: isHovering ? 0.6 : 0.3,
            borderWidth: isHovering ? 1.5 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </motion.div>

      {/* Trail */}
      {(config.type === "trail" || config.type === "flame") && (
        <>
          {trail.map((dot, i) => {
            const progress = (trail.length - 1 - i) / trail.length;
            const size = config.size * (1 - progress * 0.8);
            const opacity = (1 - progress) * (config.type === "flame" ? 0.5 : 0.35);

            return (
              <div
                key={dot.id}
                className="fixed pointer-events-none z-[9998] rounded-full"
                style={{
                  left: dot.x,
                  top: dot.y,
                  width: size,
                  height: size,
                  backgroundColor: config.type === "flame" 
                    ? `rgba(201, 169, 110, ${opacity})`
                    : config.color,
                  opacity: config.type === "flame" ? 1 : opacity,
                  transform: "translate(-50%, -50%)",
                  filter: config.type === "flame" ? `blur(${progress * 4}px)` : `blur(${progress * 1}px)`,
                  boxShadow: config.type === "flame" 
                    ? `0 0 ${size * 2}px rgba(201, 169, 110, ${opacity * 0.5})`
                    : `0 0 ${size}px ${config.color}40`,
                }}
              />
            );
          })}
        </>
      )}

      {/* Pulse ripples */}
      <AnimatePresence>
        {(config.type === "pulse" || config.type === "default") && ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="fixed pointer-events-none z-[9997] rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              border: `2px solid ${config.color}`,
              boxShadow: `0 0 20px ${config.color}40`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ width: 10, height: 10, opacity: 1 }}
            animate={{ width: 80, height: 80, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Spark burst */}
      <AnimatePresence>
        {(config.type === "spark" || config.type === "flame") && sparks.map(spark => (
          <motion.div
            key={spark.id}
            className="fixed pointer-events-none z-[9997] rounded-full"
            style={{
              left: spark.x,
              top: spark.y,
              width: spark.size,
              height: spark.size,
              backgroundColor: config.color,
              boxShadow: `0 0 ${spark.size * 2}px ${config.color}, 0 0 ${spark.size * 4}px ${config.color}80`,
            }}
            animate={{
              x: Math.cos(spark.angle) * spark.distance,
              y: Math.sin(spark.angle) * spark.distance,
              opacity: [1, 0],
              scale: [1, 0],
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}