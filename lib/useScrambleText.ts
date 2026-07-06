"use client";

import { useEffect, useRef, useState } from "react";

const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Animates `target` in from scrambled characters, resolving left to right.
 * Characters that don't change between the previous and next value settle
 * immediately; only the ones that actually changed get scrambled, so a
 * ticker showing "VS1" -> "VS2" doesn't need to shuffle the whole string.
 */
export function useScrambleText(target: string, durationMs = 500): string {
  const [display, setDisplay] = useState(target);
  const prevTarget = useRef(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const from = prevTarget.current;
    const to = target;
    prevTarget.current = target;

    if (from === to) return;

    const start = performance.now();
    const maxLen = Math.max(from.length, to.length);

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      // how many characters (left to right) are "locked in" at this point
      const lockedCount = Math.floor(progress * maxLen);

      let out = "";
      for (let i = 0; i < maxLen; i++) {
        const targetChar = to[i] ?? "";
        if (i < lockedCount || progress >= 1) {
          out += targetChar;
        } else if (targetChar === " ") {
          out += " ";
        } else if (targetChar === "") {
          out += "";
        } else {
          out += CHARSET[Math.floor(Math.random() * CHARSET.length)];
        }
      }
      setDisplay(out);

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    }

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, durationMs]);

  return display;
}
