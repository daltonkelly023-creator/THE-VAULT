"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), 1150);
    const doneTimer = setTimeout(onDone, 1550);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`loading-screen ${leaving ? "loading-screen--leaving" : ""}`}>
      <svg width="72" height="72" viewBox="0 0 72 72" className="loading-screen__facet">
        <polygon
          points="36,6 58,26 50,66 22,66 14,26"
          fill="none"
          stroke="#C9A66B"
          strokeWidth="1.2"
        />
        <polygon points="36,6 58,26 36,36 14,26" fill="none" stroke="#EDE6D8" strokeWidth="0.6" opacity="0.6" />
        <line x1="36" y1="6" x2="36" y2="66" stroke="#EDE6D8" strokeWidth="0.5" opacity="0.4" />
      </svg>
      <p className="loading-screen__label">ASSESSING THE STONE</p>
    </div>
  );
}
