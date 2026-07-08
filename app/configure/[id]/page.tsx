// app/configure/[id]/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ConfigOptions = {
  metal: "yellow-gold" | "white-gold" | "rose-gold" | "platinum" | "black-rhodium";
  stoneShape: "round" | "princess" | "oval" | "pear" | "emerald";
  stoneColor: "clear" | "black" | "blue" | "champagne" | "pink";
  bandWidth: number;
  engraving: string;
};

const metalColors: Record<string, string> = {
  "yellow-gold": "#C5A880",
  "white-gold": "#E8E8E8",
  "rose-gold": "#B76E79",
  "platinum": "#D4D4D4",
  "black-rhodium": "#2A2A2A",
};

const stoneColors: Record<string, string> = {
  clear: "#E8F4F8",
  black: "#1A1A1A",
  blue: "#4A90D9",
  champagne: "#F4E4C1",
  pink: "#F4C2C2",
};

export default function Configure() {
  const params = useParams();
  const [piece, setPiece] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ConfigOptions>({
    metal: "white-gold",
    stoneShape: "round",
    stoneColor: "clear",
    bandWidth: 2,
    engraving: "",
  });
  const [showCommission, setShowCommission] = useState(false);

  useEffect(() => {
    async function fetchPiece() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();
      setPiece(data);
      setLoading(false);
    }
    fetchPiece();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#666] tracking-widest">Loading...</p>
      </main>
    );
  }

  if (!piece) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#666]">Piece not found.</p>
      </main>
    );
  }

  const metalPriceMod = {
    "yellow-gold": 0,
    "white-gold": 500,
    "rose-gold": 300,
    "platinum": 1200,
    "black-rhodium": 800,
  };

  const stonePriceMod = {
    clear: 0,
    black: -200,
    blue: 1500,
    champagne: 800,
    pink: 2500,
  };

  const basePrice = piece.price_cents || 0;
  const totalPrice = basePrice + (metalPriceMod[config.metal] * 100) + (stonePriceMod[config.stoneColor] * 100);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#1a1a1a]">
        <Link
          href={`/piece/${params.id}`}
          className="text-[#666] hover:text-[#C5A880] transition-colors text-sm tracking-widest uppercase"
        >
          ← Back to Details
        </Link>
        <span className="text-[#C5A880] font-serif tracking-widest">THE VAULT</span>
        <button
          onClick={() => setShowCommission(true)}
          className="text-xs text-[#C5A880] border border-[#C5A880] px-4 py-2 hover:bg-[#C5A880] hover:text-[#0a0a0a] transition-all tracking-widest uppercase"
        >
          Commission
        </button>
      </div>

      <div className="pt-20 min-h-screen flex flex-col lg:flex-row">
        {/* Left: SVG Ring */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-[#0d0d0d]">
          <div className="relative w-full max-w-md aspect-square">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Band */}
              <ellipse
                cx="200"
                cy="280"
                rx="80"
                ry="30"
                fill="none"
                stroke={metalColors[config.metal]}
                strokeWidth={config.bandWidth * 3}
              />
              <ellipse
                cx="200"
                cy="280"
                rx="80"
                ry="30"
                fill="none"
                stroke={metalColors[config.metal]}
                strokeWidth={config.bandWidth}
                opacity="0.3"
              />
              
              {/* Setting/Prongs */}
              <path
                d={`M ${200 - 25} ${280 - 80} L ${200 - 15} ${280 - 110} L ${200 + 15} ${280 - 110} L ${200 + 25} ${280 - 80}`}
                fill="none"
                stroke={metalColors[config.metal]}
                strokeWidth="3"
              />
              
              {/* Stone */}
              {config.stoneShape === "round" && (
                <circle cx="200" cy="200" r="35" fill={stoneColors[config.stoneColor]} opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.7;0.9" dur="3s" repeatCount="indefinite" />
                </circle>
              )}
              {config.stoneShape === "princess" && (
                <rect x="165" y="165" width="70" height="70" fill={stoneColors[config.stoneColor]} opacity="0.9" />
              )}
              {config.stoneShape === "oval" && (
                <ellipse cx="200" cy="200" rx="45" ry="30" fill={stoneColors[config.stoneColor]} opacity="0.9" />
              )}
              {config.stoneShape === "pear" && (
                <path d="M200,165 Q230,200 200,235 Q170,200 200,165" fill={stoneColors[config.stoneColor]} opacity="0.9" />
              )}
              {config.stoneShape === "emerald" && (
                <rect x="170" y="170" width="60" height="60" rx="5" fill={stoneColors[config.stoneColor]} opacity="0.9" />
              )}

              {/* Stone highlight */}
              <ellipse cx="185" cy="185" rx="10" ry="5" fill="white" opacity="0.3" />

              {/* Engraving preview */}
              {config.engraving && (
                <text
                  x="200"
                  y="320"
                  textAnchor="middle"
                  fill={metalColors[config.metal]}
                  fontSize="8"
                  opacity="0.6"
                  fontFamily="serif"
                  letterSpacing="2"
                >
                  {config.engraving}
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full lg:w-[450px] border-l border-[#1a1a1a] p-8 lg:p-12 overflow-y-auto">
          <div className="mb-10">
            <p className="text-xs text-[#666] tracking-[0.2em] uppercase mb-2">{piece.collection}</p>
            <h1 className="text-3xl font-serif text-[#C5A880] mb-2">{piece.name}</h1>
            <p className="text-sm text-[#666]">Configurator</p>
          </div>

          {/* Metal */}
          <div className="mb-8">
            <label className="block text-xs text-[#666] tracking-widest uppercase mb-3">Metal</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(metalColors).map((metal) => (
                <button
                  key={metal}
                  onClick={() => setConfig({ ...config, metal: metal as any })}
                  className={`h-10 rounded border-2 transition-all ${
                    config.metal === metal
                      ? "border-[#C5A880] scale-110"
                      : "border-[#333] hover:border-[#666]"
                  }`}
                  style={{ backgroundColor: metalColors[metal] }}
                  title={metal.replace("-", " ")}
                />
              ))}
            </div>
            <p className="text-xs text-[#888] mt-2 capitalize">{config.metal.replace("-", " ")}</p>
          </div>

          {/* Stone Shape */}
          <div className="mb-8">
            <label className="block text-xs text-[#666] tracking-widest uppercase mb-3">Stone Shape</label>
            <div className="flex gap-2">
              {["round", "princess", "oval", "pear", "emerald"].map((shape) => (
                <button
                  key={shape}
                  onClick={() => setConfig({ ...config, stoneShape: shape as any })}
                  className={`px-3 py-2 text-xs tracking-widest uppercase border transition-all ${
                    config.stoneShape === shape
                      ? "border-[#C5A880] text-[#C5A880]"
                      : "border-[#333] text-[#666] hover:border-[#666]"
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Stone Color */}
          <div className="mb-8">
            <label className="block text-xs text-[#666] tracking-widest uppercase mb-3">Stone Color</label>
            <div className="flex gap-2">
              {Object.keys(stoneColors).map((color) => (
                <button
                  key={color}
                  onClick={() => setConfig({ ...config, stoneColor: color as any })}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    config.stoneColor === color
                      ? "border-[#C5A880] scale-110"
                      : "border-[#333] hover:border-[#666]"
                  }`}
                  style={{ backgroundColor: stoneColors[color] }}
                  title={color}
                />
              ))}
            </div>
            <p className="text-xs text-[#888] mt-2 capitalize">{config.stoneColor}</p>
          </div>

          {/* Band Width */}
          <div className="mb-8">
            <label className="block text-xs text-[#666] tracking-widest uppercase mb-3">
              Band Width: {config.bandWidth}mm
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={config.bandWidth}
              onChange={(e) => setConfig({ ...config, bandWidth: parseFloat(e.target.value) })}
              className="w-full accent-[#C5A880]"
            />
          </div>

          {/* Engraving */}
          <div className="mb-10">
            <label className="block text-xs text-[#666] tracking-widest uppercase mb-3">Engraving</label>
            <input
              type="text"
              maxLength={20}
              placeholder="Optional"
              value={config.engraving}
              onChange={(e) => setConfig({ ...config, engraving: e.target.value })}
              className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors text-sm"
            />
            <p className="text-[#444] text-xs mt-1">{config.engraving.length}/20</p>
          </div>

          {/* Price */}
          <div className="border-t border-[#222] pt-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[#666] tracking-widest uppercase">Base Price</span>
              <span className="text-sm text-[#888]">
                {basePrice === 0 ? "Upon Request" : `$${(basePrice / 100).toLocaleString()}`}
              </span>
            </div>
            {basePrice > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[#666] tracking-widest uppercase">Configuration</span>
                <span className="text-sm text-[#C5A880]">
                  +${((metalPriceMod[config.metal] + stonePriceMod[config.stoneColor])).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t border-[#222]">
              <span className="text-sm text-[#666] tracking-widest uppercase">Total Estimate</span>
              <span className="text-xl font-serif text-[#C5A880]">
                {totalPrice === 0 ? "Upon Request" : `$${(totalPrice / 100).toLocaleString()}`}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowCommission(true)}
            className="w-full py-4 bg-[#C5A880] text-[#0a0a0a] hover:bg-[#b89a70] transition-colors tracking-[0.2em] text-sm uppercase font-medium"
          >
            Commission This Configuration
          </button>
        </div>
      </div>

      {/* Commission Modal */}
      {showCommission && (
        <CommissionModal
          piece={piece}
          config={config}
          totalPrice={totalPrice}
          onClose={() => setShowCommission(false)}
        />
      )}
    </main>
  );
}

function CommissionModal({
  piece,
  config,
  totalPrice,
  onClose,
}: {
  piece: any;
  config: ConfigOptions;
  totalPrice: number;
  onClose: () => void;
}) {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: `Configuration Request:\nMetal: ${config.metal}\nStone: ${config.stoneShape} ${config.stoneColor}\nBand: ${config.bandWidth}mm\nEngraving: ${config.engraving || "None"}\n\n${formData.get("message") || ""}`,
      pieceName: `${piece.name} (Custom Configuration)`,
      collection: piece.collection,
    };

    try {
      const res = await fetch("/api/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send");
      setFormState("success");
    } catch {
      setFormState("error");
      setFormError("Failed to send. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-[#222] max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666] hover:text-[#C5A880] transition-colors text-xl"
        >
          ×
        </button>

        {formState === "success" ? (
          <div className="text-center py-8">
            <p className="text-[#C5A880] font-serif text-2xl mb-2">Request Received</p>
            <p className="text-[#888] text-sm">A master jeweler will contact you within 24 hours.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-serif text-[#C5A880] mb-2">Commission</h2>
            <p className="text-sm text-[#666] mb-6">{piece.name}</p>

            <div className="bg-[#111] border border-[#222] p-4 mb-6 text-xs space-y-1">
              <p className="text-[#666]">Configuration:</p>
              <p className="text-[#888]">Metal: {config.metal.replace("-", " ")}</p>
              <p className="text-[#888]">Stone: {config.stoneShape} {config.stoneColor}</p>
              <p className="text-[#888]">Band: {config.bandWidth}mm</p>
              {config.engraving && <p className="text-[#888]">Engraving: "{config.engraving}"</p>}
              <p className="text-[#C5A880] pt-2 border-t border-[#222]">
                {totalPrice === 0 ? "Price Upon Request" : `Estimate: $${(totalPrice / 100).toLocaleString()}`}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                type="text"
                required
                placeholder="Name"
                className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors text-sm"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors text-sm"
              />
              <textarea
                name="message"
                rows={3}
                placeholder="Additional notes (optional)"
                className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors text-sm resize-none"
              />
              {formState === "error" && <p className="text-red-400 text-xs">{formError}</p>}
              <button
                type="submit"
                disabled={formState === "submitting"}
                className="w-full py-3 bg-[#C5A880] text-[#0a0a0a] hover:bg-[#b89a70] transition-colors tracking-widest text-sm uppercase disabled:opacity-50"
              >
                {formState === "submitting" ? "Sending..." : "Submit Commission"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}