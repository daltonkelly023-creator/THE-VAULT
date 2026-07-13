"use client";

export default function OrnateCorner({ 
  position = "top-left",
  className = "" 
}: { 
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}) {
  const rotations = {
    "top-left": "rotate(0deg)",
    "top-right": "rotate(90deg)",
    "bottom-right": "rotate(180deg)",
    "bottom-left": "rotate(270deg)",
  };

  return (
    <div 
      className={`absolute w-16 h-16 md:w-20 md:h-20 pointer-events-none ${className}`}
      style={{
        top: position.includes("top") ? "-2px" : "auto",
        bottom: position.includes("bottom") ? "-2px" : "auto",
        left: position.includes("left") ? "-2px" : "auto",
        right: position.includes("right") ? "-2px" : "auto",
        transform: rotations[position],
        transformOrigin: position === "top-left" ? "0 0" : 
                        position === "top-right" ? "100% 0" :
                        position === "bottom-right" ? "100% 100%" : "0 100%",
      }}
    >
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        {/* Main corner scroll */}
        <path
          d="M 2 78 
             C 2 45, 2 35, 8 25
             C 12 18, 18 12, 25 8
             C 35 2, 45 2, 78 2"
          stroke="#c9a96e"
          strokeWidth="1.2"
          fill="none"
          opacity="0.7"
        />
        {/* Inner accent line */}
        <path
          d="M 6 78
             C 6 48, 6 38, 12 28
             C 16 22, 22 16, 28 12
             C 38 6, 48 6, 78 6"
          stroke="#c9a96e"
          strokeWidth="0.5"
          fill="none"
          opacity="0.4"
        />
        {/* Decorative curls */}
        <path
          d="M 2 55 C 2 40, 8 30, 18 22 C 28 14, 40 12, 55 2"
          stroke="#c9a96e"
          strokeWidth="0.6"
          fill="none"
          opacity="0.35"
        />
        {/* Leaf/flourish dots */}
        <circle cx="18" cy="18" r="1.5" fill="#c9a96e" opacity="0.5" />
        <circle cx="28" cy="12" r="1" fill="#c9a96e" opacity="0.4" />
        <circle cx="12" cy="28" r="1" fill="#c9a96e" opacity="0.4" />
        {/* Small curl at tip */}
        <path
          d="M 78 2 C 70 2, 65 5, 62 10 C 60 14, 62 18, 66 18"
          stroke="#c9a96e"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M 2 78 C 5 70, 8 65, 14 62 C 18 60, 22 62, 22 66"
          stroke="#c9a96e"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}