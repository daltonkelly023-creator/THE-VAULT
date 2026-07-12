"use client";

import { CursorType } from "./CustomCursor";

interface CursorConfig {
  type: CursorType;
  color: string;
  size: number;
  trailLength: number;
}

export default function CursorSettings({ 
  config, 
  onChange 
}: { 
  config: CursorConfig; 
  onChange: (c: CursorConfig) => void;
}) {
  const types: { value: CursorType; label: string; desc: string }[] = [
    { value: "default", label: "Default", desc: "Simple dot" },
    { value: "trail", label: "Trail", desc: "Fading dots follow" },
    { value: "pulse", label: "Pulse", desc: "Ring expands on click" },
    { value: "flame", label: "Flame", desc: "Soft blurred trail" },
    { value: "spark", label: "Spark", desc: "Particle burst on click" },
  ];

  const colors = [
    { value: "#c9a96e", label: "Gold" },
    { value: "#ffffff", label: "White" },
    { value: "#e8d5b7", label: "Champagne" },
    { value: "#c0a080", label: "Bronze" },
    { value: "#f5f5f5", label: "Platinum" },
  ];

  return (
    <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">Cursor Style</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => onChange({ ...config, type: type.value })}
              className={`p-3 rounded border text-left transition-all ${
                config.type === type.value
                  ? "border-[#c9a96e] bg-[#c9a96e]/10"
                  : "border-[#1a1a1a] hover:border-gray-700"
              }`}
            >
              <span className={`text-xs uppercase tracking-wider block ${
                config.type === type.value ? "text-[#c9a96e]" : "text-gray-400"
              }`}>
                {type.label}
              </span>
              <span className="text-[10px] text-gray-600 mt-1 block">{type.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-3">Color</h3>
        <div className="flex gap-3">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => onChange({ ...config, color: c.value })}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                config.color === c.value ? "border-white scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-3">Size</h3>
        <input
          type="range"
          min="4"
          max="20"
          value={config.size}
          onChange={(e) => onChange({ ...config, size: parseInt(e.target.value) })}
          className="w-full accent-[#c9a96e]"
        />
        <div className="flex justify-between text-[10px] text-gray-600 mt-1">
          <span>Small</span>
          <span>{config.size}px</span>
          <span>Large</span>
        </div>
      </div>

      {(config.type === "trail" || config.type === "flame") && (
        <div>
          <h3 className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-3">Trail Length</h3>
          <input
            type="range"
            min="3"
            max="12"
            value={config.trailLength}
            onChange={(e) => onChange({ ...config, trailLength: parseInt(e.target.value) })}
            className="w-full accent-[#c9a96e]"
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>Short</span>
            <span>{config.trailLength} dots</span>
            <span>Long</span>
          </div>
        </div>
      )}
    </div>
  );
}