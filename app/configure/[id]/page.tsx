"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
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
      {
        key: "stoneHeight",
        label: "Stone Height",
        values: [
          { label: "Flush", value: 0.15 },
          { label: "Standard", value: 0.22 },
          { label: "Elevated", value: 0.35 },
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

      <div className="pt-16 md:pt-20 min-h-screen flex flex-col lg:flex-row">
        <div className="flex-shrink-0 flex items-center justify-center p-4 md:p-8 lg:p-16 bg-[#02040a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,144,217,0.03)_0%,transparent_70%)]" />
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-full lg:max-w-md lg:h-auto lg:aspect-square">
            {piece.category === "ring" ? (
              <Suspense fallback={
                <div className="w-full h-64 md:h-80 flex items-center justify-center">
                  <span className="text-[#3a5570] text-xs tracking-widest">Forging your piece...</span>
                </div>
              }>
                <ThreeRing config={config} />
              </Suspense>
            ) : (
              <GenericPreview piece={piece} config={config} category={piece.category} />
            )}
          </div>
        </div>

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
                {opt.key === "stoneHeight" && config[opt.key] ? ` — ${config[opt.key] === 0.15 ? "Flush" : config[opt.key] === 0.22 ? "Standard" : "Elevated"}` : ""}
              </label>

              {opt.key === "bandWidth" || opt.key === "chainLength" || opt.key === "wristSize" || opt.key === "stoneSize" || opt.key === "stoneHeight" ? (
                <input
                  type="range"
                  min={opt.values[0].value as number}
                  max={opt.values[opt.values.length - 1].value as number}
                  step={opt.key === "bandWidth" ? 0.5 : opt.key === "wristSize" ? 0.5 : opt.key === "stoneHeight" ? 0.07 : 1}
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
                      className={`flex-1 min-w-[80px] md:flex-none px-3 md:px-4 py-3 md:py-2.5 text-xs tracking-widest uppercase border transition-all duration-300 ${config[opt.key] === val.value
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

      {showCommission && (
        <div
          className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${modalState === "entering" || modalState === "visible"
            ? "bg-black/80 backdrop-blur-sm"
            : "bg-black/0 backdrop-blur-none"
            }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className={`bg-[#02040a] border border-[#0a1a3a] w-full sm:max-w-md sm:rounded-none p-6 sm:p-8 relative transition-all duration-300 max-h-[90vh] overflow-y-auto ${modalState === "entering"
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
}

/* ---------- GENERIC PREVIEW FOR NON-RINGS ---------- */
function GenericPreview({ piece, config, category }: { piece: any; config: ConfigState; category: string }) {
  const [imgError, setImgError] = useState(false);

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return null;
    return `${base}/storage/v1/object/public/vault-assets/${path}`;
  };

  const imageUrl = getImageUrl(piece.hero_image_path);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {imageUrl && !imgError ? (
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
          <Image
            src={imageUrl}
            alt={piece.name}
            fill
            className="object-cover opacity-80"
            unoptimized={false}
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />
        </div>
      ) : (
        <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 border border-[#0a1a3a] flex flex-col items-center justify-center gap-2">
          <span className="text-[#1a3a5a] text-xs tracking-widest">NO PREVIEW</span>
          {piece.hero_image_path && (
            <span className="text-[#0a1a3a] text-[10px] tracking-widest uppercase">
              {imgError ? "Image missing in storage" : "No image uploaded"}
            </span>
          )}
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
  const [emailError, setEmailError] = useState("");

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setFormError("");
    setEmailError("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const name = (formData.get("name") as string).trim();

    if (!name) {
      setFormError("Name is required");
      setFormState("error");
      return;
    }

    if (!email) {
      setEmailError("Email is required");
      setFormState("error");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      setFormState("error");
      return;
    }

    const configLines = Object.entries(config)
      .filter(([k, v]) => k !== "engraving" || v)
      .map(([k, v]) => {
        const opt = catConfig.options.find((o) => o.key === k);
        const valLabel = opt?.values.find((v2) => v2.value === v)?.label || v;
        return `${opt?.label || k}: ${valLabel}`;
      })
      .join("\n");

    const data = {
      name,
      email,
      message: `Configuration Request for ${piece.name}\n\n${configLines}\n${config.engraving ? `Engraving: "${config.engraving}"\n` : ""}\n\nAdditional notes:\n${formData.get("message") || "None"}`,
      pieceName: `${piece.name} (Custom Configuration)`,
      collection: piece.collection,
      totalPrice: totalPrice,
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
        <p className="text-[#c9a96e] font-serif text-2xl mb-2">Request Received</p>
        <p className="text-gray-500 text-sm mb-6">A master jeweler will contact you within 24 hours.</p>
        <button
          onClick={onClose}
          className="text-xs text-gray-600 hover:text-[#c9a96e] transition-colors tracking-widest uppercase border-b border-[#1a1a1a] hover:border-[#c9a96e] pb-1"
        >
          Return to Configuration
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-serif text-[#c9a96e] mb-1">Commission</h2>
      <p className="text-sm text-gray-600 mb-6">{piece.name}</p>

      <div className="bg-[#111] border border-[#1a1a1a] p-4 mb-6 text-xs space-y-1.5">
        <p className="text-gray-600 tracking-widest uppercase mb-2">Configuration Summary</p>
        {catConfig.options.map((opt) => {
          const val = config[opt.key];
          const valLabel = opt.values.find((v) => v.value === val)?.label || val;
          return (
            <div key={opt.key} className="flex justify-between">
              <span className="text-gray-600">{opt.label}</span>
              <span className="text-gray-400">{valLabel}</span>
            </div>
          );
        })}
        {config.engraving && (
          <div className="flex justify-between pt-1 border-t border-[#1a1a1a]">
            <span className="text-gray-600">Engraving</span>
            <span className="text-gray-400">&ldquo;{config.engraving}&rdquo;</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-[#1a1a1a] mt-1">
          <span className="text-gray-600">Estimate</span>
          <span className="text-[#c9a96e]">
            {totalPrice === 0 ? "Upon Request" : `$${(totalPrice / 100).toLocaleString()}`}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] text-gray-600 tracking-widest uppercase mb-1">Name <span className="text-[#c9a96e]">*</span></label>
          <input
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-white focus:border-[#c9a96e] focus:outline-none transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-600 tracking-widest uppercase mb-1">Email <span className="text-[#c9a96e]">*</span></label>
          <input
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className={`w-full bg-[#111] border px-4 py-3 text-white focus:outline-none transition-colors text-sm ${emailError ? 'border-red-800 focus:border-red-600' : 'border-[#1a1a1a] focus:border-[#c9a96e]'}`}
          />
          {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
        </div>
        <textarea
          name="message"
          rows={3}
          placeholder="Additional notes (optional)"
          className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-white focus:border-[#c9a96e] focus:outline-none transition-colors text-sm resize-none"
        />
        {formError && !emailError && <p className="text-red-400 text-xs">{formError}</p>}
        <button
          type="submit"
          disabled={formState === "submitting"}
          className="w-full py-3 bg-[#c9a96e] text-[#0a0a0a] hover:bg-[#b8985d] transition-colors tracking-widest text-sm uppercase font-medium disabled:opacity-50"
        >
          {formState === "submitting" ? "Sending..." : "Submit Commission"}
        </button>
      </form>
    </>
  );
}