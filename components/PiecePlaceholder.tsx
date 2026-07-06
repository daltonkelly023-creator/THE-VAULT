"use client";

/**
 * Stands in for product photography that hasn't been shot/uploaded yet.
 * Reads as an intentional design choice (a faint gold facet mark on a
 * dark field) rather than a broken image or a gray box.
 */
export default function PiecePlaceholder({
  label = "Photography Pending",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center bg-[#0D0D0D] ${className}`}
    >
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        className="opacity-40 transition-opacity duration-700 group-hover:opacity-70"
      >
        <polygon
          points="48,10 78,34 66,86 30,86 18,34"
          fill="none"
          stroke="#C5A880"
          strokeWidth="1"
        />
        <polygon
          points="48,10 78,34 48,44 18,34"
          fill="none"
          stroke="#C5A880"
          strokeWidth="0.6"
          opacity="0.55"
        />
        <line x1="48" y1="10" x2="48" y2="86" stroke="#C5A880" strokeWidth="0.5" opacity="0.4" />
      </svg>
      <span className="absolute bottom-4 text-[9px] font-medium uppercase tracking-[0.3em] text-zinc-600">
        {label}
      </span>
    </div>
  );
}