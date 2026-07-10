"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect, Suspense } from "react";
import ThreeRing from "@/components/ThreeRing";

type ConfigState = Record<string, any>;

const metalColors: Record<string, string> = {
  "yellow-gold": "#C5A880",
  "white-gold": "#E8E8E8",
  "rose-gold": "#B76E79",
  "platinum": "#D4D4D4",
  "black-rhodium": "#2A2A2A",
  "sterling-silver": "#C0C0C0",
};

const stoneColors: Record<string, string> = {
  clear: "#E8F8FF",
  black: "#0A0A0A",
  blue: "#1E6FD9",
  champagne: "#F0D878",
  pink: "#E878A8",
  emerald: "#2E8B57",
  ruby: "#D02020",
};

interface ConfigOption {
  key: string;
  label: string;
  values: { label: string; value: string | number; price?: number }[];
}

interface CategoryConfig {
  label: string;
  options: ConfigOption[];
}

const categoryConfig: Record<string, CategoryConfig> = {
  ring: {
    label: "Ring Configuration",
    options: [
      {
        key: "metal",
        label: "Metal",
        values: [
          { label: "Yellow Gold", value: "yellow-gold", price: 0 },
          { label: "White Gold", value: "white-gold", price: 500 },
          { label: "Rose Gold", value: "rose-gold", price: 300 },
          { label: "Platinum", value: "platinum", price: 1200 },
          { label: "Black Rhodium", value: "black-rhodium", price: 800 },
        ],
      },
      {
        key: "stoneShape",
        label: "Stone Shape",
        values: [
          { label: "Round", value: "round" },
          { label: "Princess", value: "princess" },
          { label: "Oval", value: "oval" },
          { label: "Pear", value: "pear" },
          { label: "Emerald", value: "emerald" },
        ],
      },
      {
        key: "stoneColor",
        label: "Stone",
        values: [
          { label: "Diamond", value: "clear", price: 0 },
          { label: "Black Diamond", value: "black", price: -200 },
          { label: "Sapphire", value: "blue", price: 1500 },
          { label: "Champagne", value: "champagne", price: 800 },
          { label: "Pink Sapphire", value: "pink", price: 2500 },
        ],
      },
      {
        key: "bandWidth",
        label: "Band Width",
        values: [
          { label: "1.5mm", value: 1.5 },
          { label: "2mm", value: 2 },
          { label: "2.5mm", value: 2.5 },
          { label: "3mm", value: 3 },
          { label: "4mm", value: 4 },
          { label: "5mm", value: 5 },
        ],
      },
    ],
  },
  necklace: {
    label: "Necklace Configuration",
    options: [
      {
        key: "metal",
        label: "Chain Metal",
        values: [
          { label: "Yellow Gold", value: "yellow-gold", price: 0 },
          { label: "White Gold", value: "white-gold", price: 400 },
          { label: "Rose Gold", value: "rose-gold", price: 250 },
          { label: "Sterling Silver", value: "sterling-silver", price: -300 },
        ],
      },
      {
        key: "chainLength",
        label: "Chain Length",
        values: [
          { label: "16″", value: 16 },
          { label: "18″", value: 18 },
          { label: "20″", value: 20 },
          { label: "24″", value: 24 },
        ],
      },
      {
        key: "clasp",
        label: "Clasp Type",
        values: [
          { label: "Spring Ring", value: "spring-ring" },
          { label: "Lobster", value: "lobster" },
          { label: "Box", value: "box" },
          { label: "Toggle", value: "toggle" },
        ],
      },
    ],
  },
  bracelet: {
    label: "Bracelet Configuration",
    options: [
      {
        key: "metal",
        label: "Metal",
        values: [
          { label: "Yellow Gold", value: "yellow-gold", price: 0 },
          { label: "White Gold", value: "white-gold", price: 400 },
          { label: "Rose Gold", value: "rose-gold", price: 250 },
          { label: "Sterling Silver", value: "sterling-silver", price: -200 },
        ],
      },
      {
        key: "wristSize",
        label: "Wrist Size",
        values: [
          { label: "6″", value: 6 },
          { label: "6.5″", value: 6.5 },
          { label: "7″", value: 7 },
          { label: "7.5″", value: 7.5 },
          { label: "8″", value: 8 },
        ],
      },
      {
        key: "closure",
        label: "Closure",
        values: [
          { label: "Box Clasp", value: "box" },
          { label: "Toggle", value: "toggle" },
          { label: "Magnetic", value: "magnetic" },
        ],
      },
    ],
  },
  earring: {
    label: "Earring Configuration",
    options: [
      {
        key: "metal",
        label: "Metal",
        values: [
          { label: "Yellow Gold", value: "yellow-gold", price: 0 },
          { label: "White Gold", value: "white-gold", price: 300 },
          { label: "Rose Gold", value: "rose-gold", price: 200 },
        ],
      },
      {
        key: "backing",
        label: "Backing",
        values: [
          { label: "Push Back", value: "push" },
          { label: "Screw Back", value: "screw" },
          { label: "Latch Back", value: "latch" },
          { label: "Hook", value: "hook" },
        ],
      },
      {
        key: "stoneSize",
        label: "Stone Size",
        values: [
          { label: "3mm", value: 3 },
          { label: "4mm", value: 4 },
          { label: "5mm", value: 5 },
          { label: "6mm", value: 6 },
        ],
      },
    ],
  },
  watch: {
    label: "Timepiece Configuration",
    options: [
      {
        key: "strapMaterial",
        label: "Strap",
        values: [
          { label: "Leather", value: "leather", price: 0 },
          { label: "Alligator", value: "alligator", price: 400 },
          { label: "Metal Bracelet", value: "metal", price: 600 },
          { label: "Rubber", value: "rubber", price: -100 },
        ],
      },
      {
        key: "dialColor",
        label: "Dial Color",
        values: [
          { label: "Black", value: "black" },
          { label: "White", value: "white" },
          { label: "Blue", value: "blue" },
          { label: "Champagne", value: "champagne" },
        ],
      },
    ],
  },
};

export default function Configure() {
  const params = useParams();
  const [piece, setPiece] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ConfigState>({});
  const [showCommission, setShowCommission] = useState(false);
  const [modalState, setModalState] = useState<"hidden" | "entering" | "visible" | "exiting">("hidden");

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

  useEffect(() => {
    if (!piece) return;
    const cat = categoryConfig[piece.category];
    if (!cat) return;
    const defaults: ConfigState = {};
    cat.options.forEach((opt) => {
      defaults[opt.key] = opt.values[0].value;
    });
    setConfig(defaults);
  }, [piece]);

  function openModal() {
    setShowCommission(true);
    setTimeout(() => setModalState("entering"), 10);
    setTimeout(() => setModalState("visible"), 300);
  }

  function closeModal() {
    setModalState("exiting");
    setTimeout(() => {
      setModalState("hidden");
      setShowCommission(false);
    }, 300);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#3a5570] tracking-widest text-sm">Entering the atelier...</p>
      </main>
    );
  }

  if (!piece) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#444]">Piece not found.</p>
      </main>
    );
  }

  const catConfig = categoryConfig[piece.category];
  if (!catConfig) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#444]">Configuration not available for this category.</p>
      </main>
    );
  }

  const basePrice = piece.price_cents || 0;
  let modifier = 0;
  catConfig.options.forEach((opt) => {
    const val = config[opt.key];
    const found = opt.values.find((v) => v.value === val);
    if (found?.price) modifier += found.price;
  });
  const totalPrice = basePrice + modifier * 100;

  return (
    <main className="min-h-screen bg-[#02040a] text-[#e5e5e5]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-4 bg-[#02040a]/90 backdrop-blur-sm border-b border-[#0a1a3a]">
        <Link
          href={`/piece/${params.id}`}
          className="text-xs text-[#3a5570] hover:text-[#8ab4e8] transition-colors tracking-widest uppercase"
        >
          <span className="sm:hidden">← Back</span>
          <span className="hidden sm:inline">← Back to Details</span>
        </Link>
        <span className="text-[#8ab4e8] font-serif tracking-widest text-sm hidden sm:block">THE VAULT</span>
        <button
          onClick={openModal}
          className="text-xs text-[#4a90d9] border border-[#4a90d9] px-3 md:px-4 py-2 hover:bg-[#4a90d9] hover:text-[#02040a] transition-all tracking-widest uppercase"
        >
          Commission
        </button>
      </div>

      {/* MOBILE: Stacked. DESKTOP: Side-by-side */}
      <div className="pt-16 md:pt-20 min-h-screen flex flex-col lg:flex-row">
        {/* Visual — full width on mobile, half on desktop */}
        <div className="flex-shrink-0 flex items-center justify-center p-4 md:p-8 lg:p-16 bg-[#02040a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,144,217,0.03)_0%,transparent_70%)]" />
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-full lg:max-w-md lg:h-auto lg:aspect-square">
            {piece.category === "ring" ? (
  <Suspense fallback={
    <div className="w-full h-64 md:h-80 flex items-center justify-center">
      <span className="text-[#3a5570] text-xs tracking-widest">Forging your ring...</span>
    </div>
  }>
    <ThreeRing config={config} />
  </Suspense>
) : (
  <GenericPreview piece={piece} config={config} category={piece.category} />
)}
          </div>
        </div>

        {/* Controls — full width on mobile, fixed width on desktop */}
        <div className="flex-1 lg:flex-none lg:w-[450px] border-t lg:border-t-0 lg:border-l border-[#0a1a3a] p-4 md:p-8 lg:p-12 overflow-y-auto">
          <div className="mb-6 md:mb-10">
            <p className="text-xs text-[#3a5570] tracking-[0.2em] uppercase mb-2">{piece.collection}</p>
            <h1 className="text-2xl md:text-3xl font-serif text-[#8ab4e8] mb-1">{piece.name}</h1>
            <p className="text-sm text-[#3a5570]">{catConfig.label}</p>
          </div>

          {catConfig.options.map((opt) => (
            <div key={opt.key} className="mb-6 md:mb-8">
              <label className="block text-xs text-[#3a5570] tracking-widest uppercase mb-3">
                {opt.label}
                {opt.key === "bandWidth" && config[opt.key] ? ` — ${config[opt.key]}mm` : ""}
                {opt.key === "chainLength" && config[opt.key] ? ` — ${config[opt.key]}″` : ""}
                {opt.key === "wristSize" && config[opt.key] ? ` — ${config[opt.key]}″` : ""}
                {opt.key === "stoneSize" && config[opt.key] ? ` — ${config[opt.key]}mm` : ""}
              </label>

              {opt.key === "bandWidth" || opt.key === "chainLength" || opt.key === "wristSize" || opt.key === "stoneSize" ? (
                <input
                  type="range"
                  min={opt.values[0].value as number}
                  max={opt.values[opt.values.length - 1].value as number}
                  step={opt.key === "bandWidth" ? 0.5 : opt.key === "wristSize" ? 0.5 : 1}
                  value={config[opt.key] as number}
                  onChange={(e) => setConfig({ ...config, [opt.key]: parseFloat(e.target.value) })}
                  className="w-full accent-[#4a90d9] h-6 md:h-auto"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => (
                    <button
                      key={String(val.value)}
                      onClick={() => setConfig({ ...config, [opt.key]: val.value })}
                      className={`flex-1 min-w-[80px] md:flex-none px-3 md:px-4 py-3 md:py-2.5 text-xs tracking-widest uppercase border transition-all duration-300 ${
                        config[opt.key] === val.value
                          ? "border-[#4a90d9] text-[#4a90d9] bg-[#4a90d9]/10"
                          : "border-[#0a1a3a] text-[#3a5570] hover:border-[#1a3a5a] hover:text-[#5ba3e8]"
                      }`}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Engraving */}
          <div className="mb-6 md:mb-10">
            <label className="block text-xs text-[#3a5570] tracking-widest uppercase mb-3">Engraving</label>
            <input
              type="text"
              maxLength={20}
              placeholder="Optional"
              value={config.engraving || ""}
              onChange={(e) => setConfig({ ...config, engraving: e.target.value })}
              className="w-full bg-[#02040a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm"
            />
            <p className="text-[#1a3a5a] text-xs mt-1">{(config.engraving || "").length}/20</p>
          </div>

          {/* Price */}
          <div className="border-t border-[#0a1a3a] pt-4 md:pt-6 mb-4 md:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[#3a5570] tracking-widest uppercase">Base Price</span>
              <span className="text-sm text-[#5a7a9a]">
                {basePrice === 0 ? "Upon Request" : `$${(basePrice / 100).toLocaleString()}`}
              </span>
            </div>
            {basePrice > 0 && modifier !== 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[#3a5570] tracking-widest uppercase">Configuration</span>
                <span className={`text-sm ${modifier > 0 ? "text-[#4a90d9]" : "text-emerald-400"}`}>
                  {modifier > 0 ? "+" : ""}${modifier.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t border-[#0a1a3a]">
              <span className="text-sm text-[#3a5570] tracking-widest uppercase">Total Estimate</span>
              <span className="text-xl font-serif text-[#8ab4e8]">
                {totalPrice === 0 ? "Upon Request" : `$${(totalPrice / 100).toLocaleString()}`}
              </span>
            </div>
          </div>

          <button
            onClick={openModal}
            className="w-full py-4 bg-[#4a90d9] text-[#02040a] hover:bg-[#5ba3e8] transition-colors tracking-[0.2em] text-sm uppercase font-medium"
          >
            Commission This Configuration
          </button>
        </div>
      </div>

      {/* Commission Modal */}
      {showCommission && (
        <div
          className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${
            modalState === "entering" || modalState === "visible"
              ? "bg-black/80 backdrop-blur-sm"
              : "bg-black/0 backdrop-blur-none"
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className={`bg-[#02040a] border border-[#0a1a3a] w-full sm:max-w-md sm:rounded-none p-6 sm:p-8 relative transition-all duration-300 max-h-[90vh] overflow-y-auto ${
              modalState === "entering"
                ? "opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
                : modalState === "visible"
                ? "opacity-100 translate-y-0 sm:scale-100"
                : "opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
            }`}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#3a5570] hover:text-[#8ab4e8] transition-colors text-xl"
            >
              ×
            </button>

            <CommissionForm piece={piece} config={config} catConfig={catConfig} totalPrice={totalPrice} onClose={closeModal} />
          </div>
        </div>
      )}
    </main>
  );
}/* ---------- SVG RING WITH GRADIENTS ---------- */
function RingSVG({ config }: { config: ConfigState }) {
  const metal = metalColors[config.metal as string] || "#C5A880";
  const stone = stoneColors[config.stoneColor as string] || "#E8F8FF";
  const shape = config.stoneShape as string;
  const width = (config.bandWidth as number) || 2;

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
      <defs>
        <radialGradient id="metalGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={metal} stopOpacity="0.9" />
          <stop offset="50%" stopColor={metal} stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0.4" />
        </radialGradient>
        <radialGradient id="stoneGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="40%" stopColor={stone} stopOpacity="0.95" />
          <stop offset="100%" stopColor={stone} stopOpacity="0.6" />
        </radialGradient>
        <linearGradient id="bandShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Band - back half */}
      <ellipse cx="200" cy="280" rx="80" ry="28" fill="none" stroke="url(#metalGrad)" strokeWidth={width * 3} opacity="0.4" />

      {/* Prongs */}
      <path d="M175 200 L185 170 L215 170 L225 200" fill="none" stroke={metal} strokeWidth="3" />
      <path d="M170 210 L180 180 L220 180 L230 210" fill="none" stroke={metal} strokeWidth="2" opacity="0.5" />

      {/* Stone */}
      {shape === "round" && (
        <g>
          <circle cx="200" cy="185" r="38" fill="url(#stoneGrad)" filter="url(#glow)" />
          <circle cx="200" cy="185" r="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <circle cx="200" cy="185" r="20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <ellipse cx="185" cy="170" rx="12" ry="6" fill="white" opacity="0.25" />
        </g>
      )}
      {shape === "princess" && (
        <g>
          <rect x="162" y="147" width="76" height="76" fill="url(#stoneGrad)" filter="url(#glow)" />
          <rect x="170" y="155" width="60" height="60" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="178" y="163" width="44" height="44" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <polygon points="200,155 230,185 200,215 170,185" fill="white" opacity="0.15" />
        </g>
      )}
      {shape === "oval" && (
        <g>
          <ellipse cx="200" cy="185" rx="50" ry="32" fill="url(#stoneGrad)" filter="url(#glow)" />
          <ellipse cx="200" cy="185" rx="40" ry="24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <ellipse cx="200" cy="185" rx="28" ry="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <ellipse cx="185" cy="170" rx="14" ry="6" fill="white" opacity="0.25" />
        </g>
      )}
      {shape === "pear" && (
        <g>
          <path d="M200,150 Q240,185 200,220 Q160,185 200,150" fill="url(#stoneGrad)" filter="url(#glow)" />
          <path d="M200,160 Q230,185 200,210 Q170,185 200,160" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <ellipse cx="190" cy="165" rx="10" ry="5" fill="white" opacity="0.25" />
        </g>
      )}
      {shape === "emerald" && (
        <g>
          <rect x="165" y="150" width="70" height="70" rx="8" fill="url(#stoneGrad)" filter="url(#glow)" />
          <rect x="173" y="158" width="54" height="54" rx="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="181" y="166" width="38" height="38" rx="2" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <polygon points="200,158 220,185 200,212 180,185" fill="white" opacity="0.15" />
        </g>
      )}

      {/* Band - front half */}
      <ellipse cx="200" cy="280" rx="80" ry="28" fill="none" stroke="url(#metalGrad)" strokeWidth={width * 3} />
      <ellipse cx="200" cy="280" rx="80" ry="28" fill="none" stroke="url(#bandShine)" strokeWidth={width * 3} opacity="0.6" />

      {/* Engraving */}
      {config.engraving && (
        <text x="200" y="320" textAnchor="middle" fill={metal} fontSize="8" opacity="0.5" fontFamily="serif" letterSpacing="2">
          {config.engraving}
        </text>
      )}
    </svg>
  );
}

/* ---------- GENERIC PREVIEW FOR NON-RINGS ---------- */
function GenericPreview({ piece, config, category }: { piece: any; config: ConfigState; category: string }) {
  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`;
  };

  const imageUrl = getImageUrl(piece.hero_image_path);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {imageUrl ? (
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
          <img src={imageUrl} alt={piece.name} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />
        </div>
      ) : (
        <div className="w-48 h-48 sm:w-64 sm:h-64 border border-[#0a1a3a] flex items-center justify-center">
          <span className="text-[#1a3a5a] text-xs tracking-widest">NO PREVIEW</span>
        </div>
      )}

      <div className="mt-6 sm:mt-8 space-y-2 text-center">
        <p className="text-[10px] text-[#3a5570] tracking-[0.2em] uppercase">{category} Configuration</p>
        {Object.entries(config).map(([key, val]) => {
          if (key === "engraving" && !val) return null;
          return (
            <p key={key} className="text-xs text-[#5a7a9a]">
              <span className="text-[#3a5570] capitalize">{key.replace(/([A-Z])/g, " $1")}: </span>
              <span className="text-[#8ab4e8]">{val}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- COMMISSION FORM ---------- */
function CommissionForm({
  piece,
  config,
  catConfig,
  totalPrice,
  onClose,
}: {
  piece: any;
  config: ConfigState;
  catConfig: CategoryConfig;
  totalPrice: number;
  onClose: () => void;
}) {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");

    const formData = new FormData(e.currentTarget);
    const configLines = Object.entries(config)
      .filter(([k, v]) => k !== "engraving" || v)
      .map(([k, v]) => {
        const opt = catConfig.options.find((o) => o.key === k);
        const valLabel = opt?.values.find((v2) => v2.value === v)?.label || v;
        return `${opt?.label || k}: ${valLabel}`;
      })
      .join("\n");

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: `Configuration Request for ${piece.name}\n\n${configLines}\n${config.engraving ? `Engraving: "${config.engraving}"\n` : ""}\n\nAdditional notes:\n${formData.get("message") || "None"}`,
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

  if (formState === "success") {
    return (
      <div className="text-center py-8">
        <p className="text-[#8ab4e8] font-serif text-2xl mb-2">Request Received</p>
        <p className="text-[#5a7a9a] text-sm mb-6">A master jeweler will contact you within 24 hours.</p>
        <button
          onClick={onClose}
          className="text-xs text-[#3a5570] hover:text-[#8ab4e8] transition-colors tracking-widest uppercase border-b border-[#0a1a3a] hover:border-[#4a90d9] pb-1"
        >
          Return to Configuration
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-serif text-[#8ab4e8] mb-1">Commission</h2>
      <p className="text-sm text-[#3a5570] mb-6">{piece.name}</p>

      <div className="bg-[#02040a] border border-[#0a1a3a] p-4 mb-6 text-xs space-y-1.5">
        <p className="text-[#3a5570] tracking-widest uppercase mb-2">Configuration Summary</p>
        {catConfig.options.map((opt) => {
          const val = config[opt.key];
          const valLabel = opt.values.find((v) => v.value === val)?.label || val;
          return (
            <div key={opt.key} className="flex justify-between">
              <span className="text-[#3a5570]">{opt.label}</span>
              <span className="text-[#5a7a9a]">{valLabel}</span>
            </div>
          );
        })}
        {config.engraving && (
          <div className="flex justify-between pt-1 border-t border-[#0a1a3a]">
            <span className="text-[#3a5570]">Engraving</span>
            <span className="text-[#5a7a9a]">&ldquo;{config.engraving}&rdquo;</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-[#0a1a3a] mt-1">
          <span className="text-[#3a5570]">Estimate</span>
          <span className="text-[#8ab4e8]">
            {totalPrice === 0 ? "Upon Request" : `$${(totalPrice / 100).toLocaleString()}`}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          required
          placeholder="Name"
          className="w-full bg-[#02040a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full bg-[#02040a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm"
        />
        <textarea
          name="message"
          rows={3}
          placeholder="Additional notes (optional)"
          className="w-full bg-[#02040a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm resize-none"
        />
        {formState === "error" && <p className="text-red-400 text-xs">{formError}</p>}
        <button
          type="submit"
          disabled={formState === "submitting"}
          className="w-full py-3 bg-[#4a90d9] text-[#02040a] hover:bg-[#5ba3e8] transition-colors tracking-widest text-sm uppercase disabled:opacity-50"
        >
          {formState === "submitting" ? "Sending..." : "Submit Commission"}
        </button>
      </form>
    </>
  );
}