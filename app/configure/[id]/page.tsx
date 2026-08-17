"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Atelier2DRing from "@/components/Atelier2DRing";
import Particles from "@/components/Particles";
import OrnateCorner from "@/components/OrnateCorner";
import { motion, AnimatePresence } from "framer-motion";

type ConfigState = Record<string, any>;

const metalColors: Record<string, string> = {
  "yellow-gold": "#C5A880",
  "white-gold": "#E8E8E8",
  "rose-gold": "#B76E79",
  "platinum": "#D4D4D4",
  "black-rhodium": "#2A2A2A",
  "sterling-silver": "#C0C0C0",
};

const stoneGemStops: Record<string, [string, string]> = {
  clear: ["#ffffff", "#5a8ec8"],
  black: ["#4a4a4a", "#0a0a0a"],
  blue: ["#8ac8ff", "#123a75"],
  champagne: ["#f5e8b8", "#8a6c22"],
  pink: ["#ffc8e0", "#8a3358"],
};

const metalSwatchStops: Record<string, [string, string, string]> = {
  "yellow-gold": ["#f0e0b8", "#c5a880", "#7a6032"],
  "white-gold": ["#ffffff", "#c8c8c8", "#6a6a6a"],
  "rose-gold": ["#f5c8d0", "#b76e79", "#5a3238"],
  platinum: ["#ffffff", "#d0d0d0", "#7a7a7a"],
  "black-rhodium": ["#5a5a5a", "#2a2a2a", "#0a0a0a"],
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
        key: "settingStyle",
        label: "Setting",
        values: [
          { label: "Solitaire", value: "solitaire", price: 0 },
          { label: "Halo", value: "halo", price: 650 },
          { label: "Three-Stone", value: "three-stone", price: 900 },
        ],
      },
      {
        key: "bandStyle",
        label: "Band",
        values: [
          { label: "Classic", value: "classic", price: 0 },
          { label: "Cathedral", value: "cathedral", price: 300 },
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

/* ---------- ANIMATED PRICE ---------- */
function AnimatedPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const duration = 500;
    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) frameId = requestAnimationFrame(tick);
      else prevRef.current = end;
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <span className="text-2xl font-serif italic text-[#c9a96e] tracking-wide">
      {value === 0 ? "Upon Request" : `$${(display / 100).toLocaleString()}`}
    </span>
  );
}

export default function Configure() {
  const params = useParams();
  const [piece, setPiece] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ConfigState>({});
  const [showCommission, setShowCommission] = useState(false);
  const [modalState, setModalState] = useState<"hidden" | "entering" | "visible" | "exiting">("hidden");
  const [openChapter, setOpenChapter] = useState(0);
  const [pricePulse, setPricePulse] = useState(false);

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

  function updateConfig(updates: Record<string, any>) {
    setConfig({ ...config, ...updates });
    setPricePulse(true);
    setTimeout(() => setPricePulse(false), 400);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
        <Particles />
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-12 h-12 mx-auto mb-6 border border-[#c9a96e]/40 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-[#c9a96e] rounded-full animate-pulse shadow-[0_0_20px_rgba(201,169,110,0.5)]" />
            </div>
          </motion.div>
          <p className="text-[#c9a96e]/60 tracking-[0.4em] text-xs uppercase">Entering the atelier...</p>
        </div>
      </main>
    );
  }

  if (!piece) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#444] tracking-widest uppercase text-xs">Piece not found.</p>
      </main>
    );
  }

  const catConfig = categoryConfig[piece.category];
  if (!catConfig) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#444] tracking-widest uppercase text-xs">Configuration not available for this category.</p>
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

  const isRing = piece.category === "ring";

  const shapeValues = catConfig.options.find((o) => o.key === "stoneShape")?.values || [];
  const stoneColorValues = catConfig.options.find((o) => o.key === "stoneColor")?.values || [];
  const settingStyleValues = catConfig.options.find((o) => o.key === "settingStyle")?.values || [];
  const bandStyleValues = catConfig.options.find((o) => o.key === "bandStyle")?.values || [];
  const metalValues = catConfig.options.find((o) => o.key === "metal")?.values || [];

  const stoneShapeLabel = shapeValues.find((v) => v.value === config.stoneShape)?.label || "";
  const stoneColorLabel = stoneColorValues.find((v) => v.value === config.stoneColor)?.label || "";
  const settingStyleLabel = settingStyleValues.find((v) => v.value === config.settingStyle)?.label || "";
  const bandStyleLabel = bandStyleValues.find((v) => v.value === config.bandStyle)?.label || "";
  const metalLabel = metalValues.find((v) => v.value === config.metal)?.label || "";
  const stoneHeightLabel =
    config.stoneHeight === 0.15 ? "Flush" : config.stoneHeight === 0.22 ? "Standard" : "Elevated";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] font-light relative overflow-hidden">
      {/* PARTICLES BACKGROUND */}
      <Particles />

      {/* BACKGROUND GLOW LAYERS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.12)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(201,169,110,0.08)_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(74,144,217,0.05)_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(0,0,0,0.6)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,0,0,0.5)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />
      </div>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-[#c9a96e]/15">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ boxShadow: ["0 0 8px rgba(201,169,110,0.3)", "0 0 16px rgba(201,169,110,0.6)", "0 0 8px rgba(201,169,110,0.3)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-2.5 h-2.5 rounded-full bg-[#c9a96e]"
          />
          <div>
            <h1 className="text-[10px] tracking-[0.35em] text-[#c9a96e] uppercase font-medium">The Vault</h1>
            <p className="text-[8px] tracking-[0.2em] text-gray-600 uppercase">Atelier — 01</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          <span className="text-[8px] tracking-[0.2em] text-gray-500 uppercase border border-[#c9a96e]/20 px-3.5 py-1.5 rounded-full bg-[#c9a96e]/[0.02] backdrop-blur-sm">
            Live Render
          </span>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-3 justify-end">
            <h2 className="text-xs tracking-[0.3em] text-gray-300 uppercase">{catConfig.label}</h2>
            <span className="text-[8px] tracking-[0.2em] text-[#c9a96e]/70 uppercase border border-[#c9a96e]/25 px-2.5 py-1 rounded-sm bg-[#c9a96e]/[0.03]">
              Atelier
            </span>
          </div>
          <p className="text-[8px] tracking-[0.15em] text-gray-600 mt-1">
            Configure • Commission • Heirloom
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-8 min-h-screen flex flex-col lg:flex-row relative z-10">
        {/* Left: Preview */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16 relative overflow-hidden">
          <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
            {/* PREVIEW FRAME */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              {/* Outer ring glow */}
              <div className="absolute inset-4 rounded-full border border-[#c9a96e]/8 pointer-events-none" />
              <div className="absolute inset-12 rounded-full border border-[#c9a96e]/5 pointer-events-none" />

              {/* Ornate corners */}
              <OrnateCorner position="top-left" />
              <OrnateCorner position="top-right" />
              <OrnateCorner position="bottom-left" />
              <OrnateCorner position="bottom-right" />

              {/* Stage pedestal */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isRing ? (
                  <div className="relative w-[90%] h-[90%] flex items-center justify-center">
                    {/* Ambient light halo behind ring */}
                    <div className="absolute w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.12)_0%,transparent_70%)] pointer-events-none" />

                    <Atelier2DRing config={config} />

                    {/* Floating spec tags */}
                    <div className="absolute top-4 left-0 flex flex-col items-start gap-2.5 max-w-[45%]">
                      <AnimatedSpecTag
                        dot
                        label={`${config.bandWidth}mm Band`}
                      />
                      <AnimatedSpecTag label={`${stoneHeightLabel} Profile`} />
                      {config.settingStyle && config.settingStyle !== "solitaire" && (
                        <AnimatedSpecTag label={`${settingStyleLabel} Setting`} />
                      )}
                      {config.bandStyle && config.bandStyle !== "classic" && (
                        <AnimatedSpecTag label={`${bandStyleLabel} Band`} />
                      )}
                    </div>
                  </div>
                ) : (
                  <GenericPreview piece={piece} config={config} category={piece.category} />
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom left status */}
          <div className="absolute bottom-4 left-6 md:left-10 flex items-center gap-4 text-[8px] tracking-[0.2em] text-gray-700 uppercase">
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#c9a96e]/50" />
              Atelier View • 1:1
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-800" />
            <span>Torus Sculpt • Real-Time</span>
          </div>

          <div className="absolute bottom-4 right-6 md:right-10 text-[8px] tracking-[0.2em] text-gray-700 uppercase">
            © The Vault
          </div>
        </div>

        {/* Right: Specification Ledger */}
        <div className="flex-1 lg:flex-none lg:w-[520px] lg:h-[calc(100vh-96px)] border-t lg:border-t-0 lg:border-l border-[#c9a96e]/10 flex flex-col bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#0a0a0a]/80 backdrop-blur-xl relative overflow-hidden">
          {/* Ledger side accent */}
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#c9a96e]/20 to-transparent" />

          <div className="flex-1 lg:overflow-y-auto p-6 md:p-10 lg:p-12 pb-6 custom-scroll">
            {/* Ledger header */}
            <div className="relative mb-10">
              <OrnateCorner position="top-right" className="w-14 h-14 opacity-50" />
              <div className="flex items-end justify-between pb-6 border-b border-[#c9a96e]/15 relative z-10">
                <div>
                  <p className="text-[8px] tracking-[0.35em] text-[#c9a96e]/60 uppercase mb-2">Specification</p>
                  <motion.h2
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="font-serif italic text-3xl text-gray-200 tracking-wide"
                  >
                    {piece.name}
                  </motion.h2>
                </div>
                {isRing && (
                  <motion.span
                    key={openChapter}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-[8px] tracking-[0.25em] text-gray-600 uppercase border border-[#c9a96e]/20 rounded-full px-3 py-1.5 whitespace-nowrap bg-[#c9a96e]/[0.03]"
                  >
                    {String(openChapter + 1).padStart(2, "0")} / 03
                  </motion.span>
                )}
              </div>
            </div>

            {isRing ? (
              <div className="space-y-4">
                <Chapter
                  roman="I"
                  title="The Stone"
                  summary={`${stoneShapeLabel} · ${stoneColorLabel}`}
                  open={openChapter === 0}
                  onToggle={() => setOpenChapter(openChapter === 0 ? -1 : 0)}
                >
                  <div className="space-y-7">
                    <div>
                      <p className="text-[8px] tracking-[0.25em] text-gray-600 uppercase mb-4 flex items-center gap-2">
                        <span className="w-6 h-px bg-[#c9a96e]/30" />
                        Cut
                      </p>
                      <div className="grid grid-cols-5 gap-2.5">
                        {shapeValues.map((val) => (
                          <SwatchTile
                            key={String(val.value)}
                            selected={config.stoneShape === val.value}
                            onClick={() => updateConfig({ stoneShape: val.value })}
                            label={val.label}
                            icon={<ShapeIcon shape={val.value as string} active={config.stoneShape === val.value} />}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] tracking-[0.25em] text-gray-600 uppercase mb-4 flex items-center gap-2">
                        <span className="w-6 h-px bg-[#c9a96e]/30" />
                        Stone
                      </p>
                      <div className="grid grid-cols-5 gap-2.5">
                        {stoneColorValues.map((val) => (
                          <SwatchTile
                            key={String(val.value)}
                            selected={config.stoneColor === val.value}
                            onClick={() => updateConfig({ stoneColor: val.value })}
                            label={val.label}
                            icon={<GemSwatch colorKey={val.value as string} />}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Chapter>

                <Chapter
                  roman="II"
                  title="Setting"
                  summary={`${settingStyleLabel} · ${stoneHeightLabel}`}
                  open={openChapter === 1}
                  onToggle={() => setOpenChapter(openChapter === 1 ? -1 : 1)}
                >
                  <div className="space-y-7">
                    <div>
                      <p className="text-[8px] tracking-[0.25em] text-gray-600 uppercase mb-4 flex items-center gap-2">
                        <span className="w-6 h-px bg-[#c9a96e]/30" />
                        Style
                      </p>
                      <div className="grid grid-cols-3 gap-2.5">
                        {settingStyleValues.map((val) => (
                          <SwatchTile
                            key={String(val.value)}
                            selected={config.settingStyle === val.value}
                            onClick={() => updateConfig({ settingStyle: val.value })}
                            label={val.label}
                            icon={<SettingIcon style={val.value as string} active={config.settingStyle === val.value} />}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] tracking-[0.25em] text-gray-600 uppercase mb-4 flex items-center gap-2">
                        <span className="w-6 h-px bg-[#c9a96e]/30" />
                        Stone Height — <span className="text-[#c9a96e]/80">{stoneHeightLabel}</span>
                      </p>
                      <RefinedSlider
                        value={config.stoneHeight as number}
                        min={0.15}
                        max={0.35}
                        step={0.07}
                        onChange={(v) => updateConfig({ stoneHeight: v })}
                        formatValue={() => stoneHeightLabel}
                        leftLabel="Flush"
                        rightLabel="Raised"
                      />
                    </div>
                  </div>
                </Chapter>

                <Chapter
                  roman="III"
                  title="Metal & Band"
                  summary={`${metalLabel} · ${bandStyleLabel}`}
                  open={openChapter === 2}
                  onToggle={() => setOpenChapter(openChapter === 2 ? -1 : 2)}
                >
                  <div className="space-y-7">
                    <div>
                      <p className="text-[8px] tracking-[0.25em] text-gray-600 uppercase mb-4 flex items-center gap-2">
                        <span className="w-6 h-px bg-[#c9a96e]/30" />
                        Metal
                      </p>
                      <div className="grid grid-cols-5 gap-2.5">
                        {metalValues.map((val) => (
                          <SwatchTile
                            key={String(val.value)}
                            selected={config.metal === val.value}
                            onClick={() => updateConfig({ metal: val.value })}
                            label={val.label}
                            icon={<MetalSwatch metalKey={val.value as string} />}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] tracking-[0.25em] text-gray-600 uppercase mb-4 flex items-center gap-2">
                        <span className="w-6 h-px bg-[#c9a96e]/30" />
                        Band
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {bandStyleValues.map((val) => (
                          <SwatchTile
                            key={String(val.value)}
                            selected={config.bandStyle === val.value}
                            onClick={() => updateConfig({ bandStyle: val.value })}
                            label={val.label}
                            icon={<BandIcon style={val.value as string} active={config.bandStyle === val.value} />}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] tracking-[0.25em] text-gray-600 uppercase mb-4 flex items-center gap-2">
                        <span className="w-6 h-px bg-[#c9a96e]/30" />
                        Band Width — <span className="text-[#c9a96e]/80">{config.bandWidth}mm</span>
                      </p>
                      <RefinedSlider
                        value={config.bandWidth as number}
                        min={1.5}
                        max={5}
                        step={0.5}
                        onChange={(v) => updateConfig({ bandWidth: v })}
                        formatValue={(v) => `${v}mm`}
                        leftLabel="1.5mm"
                        rightLabel="5mm"
                      />
                    </div>
                  </div>
                </Chapter>
              </div>
            ) : (
              <>
                {/* Metal */}
                <div className="mb-12">
                  <SectionHeader label={catConfig.options.find((o) => o.key === "metal")?.label || "Metal"} />
                  <div className="flex flex-wrap gap-2.5">
                    {catConfig.options.find((o) => o.key === "metal")?.values.map((val) => (
                      <PillButton
                        key={String(val.value)}
                        selected={config.metal === val.value}
                        onClick={() => updateConfig({ metal: val.value })}
                      >
                        {val.label}
                      </PillButton>
                    ))}
                  </div>
                </div>

                {/* Dynamic Options */}
                {catConfig.options
                  .filter((opt) => opt.key !== "metal")
                  .map((opt) => (
                    <div key={opt.key} className="mb-12">
                      <SectionHeader label={opt.label} />

                      {["chainLength", "wristSize", "stoneSize"].includes(opt.key) ? (
                        <RefinedSlider
                          value={config[opt.key] as number}
                          min={opt.values[0].value as number}
                          max={opt.values[opt.values.length - 1].value as number}
                          step={opt.key === "wristSize" ? 0.5 : 1}
                          onChange={(v) => updateConfig({ [opt.key]: v })}
                          formatValue={(v) => String(v)}
                          leftLabel={String(opt.values[0].value)}
                          rightLabel={String(opt.values[opt.values.length - 1].value)}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2.5">
                          {opt.values.map((val) => (
                            <PillButton
                              key={String(val.value)}
                              selected={config[opt.key] === val.value}
                              onClick={() => updateConfig({ [opt.key]: val.value })}
                            >
                              {val.label}
                            </PillButton>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </>
            )}
          </div>

          {/* Ledger footer */}
          <div className="border-t border-[#c9a96e]/15 p-6 md:p-10 lg:p-12 pt-7 shrink-0 relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/25 to-transparent" />

            <motion.div
              animate={pricePulse ? { boxShadow: ["0 0 0px rgba(201,169,110,0)", "0 0 30px rgba(201,169,110,0.12)", "0 0 0px rgba(201,169,110,0)"] } : {}}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden border border-[#c9a96e]/20 rounded-sm p-5 mb-5 bg-gradient-to-br from-[#0a0a0a]/90 via-[#0a0a0a]/80 to-[#0a0a0a]/90"
            >
              <OrnateCorner position="top-right" className="w-10 h-10 opacity-40" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(201,169,110,0.08)_0%,transparent_65%)] pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/15 to-transparent" />

              <div className="flex items-center justify-between mb-5">
                <span className="text-[8px] tracking-[0.3em] text-gray-600 uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] shadow-[0_0_6px_rgba(201,169,110,0.4)]" />
                  Estimate
                </span>
                <span className="flex items-center gap-1.5 text-[8px] tracking-[0.25em] text-gray-700 uppercase">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.6">
                    <path d="M12 2 L19 9 L12 22 L5 9 Z" />
                  </svg>
                  Certified
                </span>
              </div>

              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[9px] tracking-[0.2em] text-gray-600 uppercase">Base Price</span>
                <span className="text-xs text-gray-500 font-light">
                  {basePrice === 0 ? "Upon Request" : `$${(basePrice / 100).toLocaleString()}`}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {basePrice > 0 && modifier !== 0 && (
                  <motion.div
                    key={modifier}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-between items-center mb-2.5"
                  >
                    <span className="text-[9px] tracking-[0.2em] text-gray-600 uppercase">Configuration</span>
                    <span className={`text-xs font-medium ${modifier > 0 ? "text-[#c9a96e]" : "text-emerald-400"}`}>
                      {modifier > 0 ? "+" : ""}${modifier.toLocaleString()}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-baseline pt-4 mt-2 border-t border-[#c9a96e]/12 relative">
                <span className="text-[9px] tracking-[0.25em] text-gray-500 uppercase">Total Estimate</span>
                <AnimatedPrice value={totalPrice} />
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={openModal}
              className="group relative w-full py-4.5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#c9a96e] via-[#d9bf89] to-[#c9a96e] bg-[length:200%_100%] group-hover:bg-[position:100%_0] transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ boxShadow: "0 0 40px rgba(201,169,110,0.35), inset 0 1px 0 rgba(255,255,255,0.2)" }} />
              <span className="relative text-[#0a0a0a] tracking-[0.3em] text-[11px] uppercase font-semibold flex items-center justify-center gap-2.5">
                Commission This Configuration
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-500 group-hover:translate-x-0.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </motion.button>
            <p className="text-center text-[8px] tracking-[0.2em] text-gray-700 uppercase mt-4.5">
              A Master Jeweler Reviews Every Commission
            </p>
          </div>
        </div>
      </div>

      {/* Commission Modal */}
      <AnimatePresence>
        {showCommission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative bg-gradient-to-b from-[#0a0a0a] via-[#0e0e0e] to-[#0a0a0a] border border-[#c9a96e]/20 w-full sm:max-w-md sm:rounded-sm p-8 sm:p-10 max-h-[90vh] overflow-y-auto custom-scroll"
            >
              <OrnateCorner position="top-right" className="w-14 h-14 opacity-40" />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:text-[#c9a96e] hover:bg-[#c9a96e]/5 transition-all duration-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <CommissionForm piece={piece} config={config} catConfig={catConfig} totalPrice={totalPrice} onClose={closeModal} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ---------- SECTION HEADER ---------- */
function SectionHeader({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-1 rounded-full bg-[#c9a96e] shadow-[0_0_4px_rgba(201,169,110,0.4)]" />
      <span className="text-[9px] tracking-[0.3em] text-gray-500 uppercase">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-[#c9a96e]/15 to-transparent" />
    </div>
  );
}

/* ---------- PILL BUTTON ---------- */
function PillButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className={`px-4.5 py-2.5 text-[9px] tracking-[0.2em] uppercase border rounded-full transition-all duration-400 relative overflow-hidden ${
        selected
          ? "border-[#c9a96e]/70 text-[#c9a96e] bg-gradient-to-r from-[#c9a96e]/12 via-[#c9a96e]/8 to-[#c9a96e]/12 shadow-[0_0_20px_rgba(201,169,110,0.15),inset_0_0_12px_rgba(201,169,110,0.05)]"
          : "border-[#1a1a1a] text-gray-600 hover:border-[#c9a96e]/30 hover:text-gray-400 hover:bg-[#c9a96e]/[0.03]"
      }`}
    >
      {selected && (
        <motion.span
          layoutId="pill-glow"
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(201,169,110,0.08),transparent_70%)]"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative">{children}</span>
    </motion.button>
  );
}

/* ---------- ANIMATED SPEC TAG ---------- */
function AnimatedSpecTag({ label, dot = false }: { label: string; dot?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-gradient-to-r from-[#0a0a0a]/85 via-[#0a0a0a]/90 to-[#0a0a0a]/75 backdrop-blur-md border border-[#c9a96e]/20 rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />}
        <span className="text-[8px] tracking-[0.22em] text-gray-400 uppercase">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

/* ---------- SPECIFICATION CHAPTER ---------- */
function Chapter({
  roman,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  roman: string;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <motion.div
      layout
      className={`border rounded-sm overflow-hidden transition-all duration-500 relative ${
        open
          ? "border-[#c9a96e]/30 bg-gradient-to-b from-[#c9a96e]/[0.05] via-[#0a0a0a]/50 to-[#0a0a0a]/30 shadow-[0_4px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(201,169,110,0.06)]"
          : "border-[#1a1a1a] hover:border-[#c9a96e]/20 bg-[#0a0a0a]/30"
      }`}
    >
      {open && (
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/25 to-transparent" />
      )}
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ backgroundColor: open ? "rgba(201,169,110,0.04)" : "rgba(255,255,255,0.015)" }}
        className="w-full flex items-center justify-between gap-3 px-5.5 py-4.5 text-left relative"
      >
        <span className="flex items-center gap-4 min-w-0">
          <span className={`font-serif italic text-sm shrink-0 transition-colors duration-300 ${open ? "text-[#c9a96e]" : "text-gray-600"}`}>
            {roman}
          </span>
          <span className={`text-[11px] tracking-[0.28em] uppercase shrink-0 transition-colors duration-300 ${open ? "text-gray-200" : "text-gray-500"}`}>
            {title}
          </span>
        </span>
        <span className="flex items-center gap-3 min-w-0">
          {!open && (
            <span className="text-[9px] text-gray-600 tracking-wide normal-case truncate max-w-[180px] transition-opacity duration-300">
              {summary}
            </span>
          )}
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className={`text-lg leading-none shrink-0 ${open ? "text-[#c9a96e]" : "text-[#c9a96e]/70"}`}
          >
            +
          </motion.span>
        </span>
      </motion.button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <div className="px-5.5 pb-7 pt-1.5 relative">
          {open && (
            <div className="absolute top-0 left-12 w-px h-full bg-gradient-to-b from-[#c9a96e]/20 via-[#c9a96e]/8 to-transparent" />
          )}
          <div className="pl-3">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- SWATCH TILE ---------- */
function SwatchTile({
  selected,
  onClick,
  label,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`flex flex-col items-center gap-2.5 py-3.5 px-1.5 rounded-sm border transition-all duration-400 relative overflow-hidden ${
        selected
          ? "border-[#c9a96e]/50 bg-gradient-to-b from-[#c9a96e]/[0.08] via-[#c9a96e]/[0.04] to-transparent shadow-[0_4px_20px_rgba(201,169,110,0.12),inset_0_1px_0_rgba(201,169,110,0.08)]"
          : "border-[#1a1a1a] hover:border-[#c9a96e]/25 hover:bg-[#c9a96e]/[0.02]"
      }`}
    >
      {selected && (
        <motion.div
          layoutId="swatch-border-glow"
          className="absolute inset-0 rounded-sm pointer-events-none"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(201,169,110,0.15)",
            background: "radial-gradient(circle at 50% 0%, rgba(201,169,110,0.08), transparent 60%)",
          }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div className="relative">{icon}</div>
      <span className={`text-[8px] tracking-[0.18em] uppercase leading-tight text-center relative transition-colors duration-300 ${selected ? "text-[#c9a96e]" : "text-gray-600"}`}>
        {label}
      </span>
    </motion.button>
  );
}

/* ---------- CUT ICON ---------- */
function ShapeIcon({ shape, active }: { shape: string; active: boolean }) {
  const stroke = active ? "#c9a96e" : "#666";
  const fill = active ? "rgba(201,169,110,0.06)" : "transparent";
  const shadow = active ? "drop-shadow(0 0 4px rgba(201,169,110,0.3))" : "none";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ filter: shadow }}>
      {shape === "round" && <circle cx="12" cy="12" r="7.5" fill={fill} stroke={stroke} strokeWidth="1.2" />}
      {shape === "princess" && <rect x="4.5" y="4.5" width="15" height="15" rx="1.2" fill={fill} stroke={stroke} strokeWidth="1.2" />}
      {shape === "oval" && <ellipse cx="12" cy="12" rx="5.5" ry="8.5" fill={fill} stroke={stroke} strokeWidth="1.2" />}
      {shape === "pear" && <path d="M12 3 C17 8 18 14 12 21 C6 14 7 8 12 3 Z" fill={fill} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />}
      {shape === "emerald" && <polygon points="7.5,4 16.5,4 20,7.5 20,16.5 16.5,20 7.5,20 4,16.5 4,7.5" fill={fill} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />}
    </svg>
  );
}

/* ---------- SETTING STYLE ICON ---------- */
function SettingIcon({ style, active }: { style: string; active: boolean }) {
  const color = active ? "#c9a96e" : "#666";
  const glow = active ? "drop-shadow(0 0 3px rgba(201,169,110,0.3))" : "none";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ filter: glow }}>
      {style === "solitaire" && <circle cx="12" cy="12" r="3.6" fill={color} opacity={active ? 0.9 : 0.75} />}
      {style === "halo" && (
        <>
          <circle cx="12" cy="12" r="3.2" fill={color} opacity={active ? 0.95 : 0.8} />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={12 + Math.cos(a) * 7.8}
                cy={12 + Math.sin(a) * 7.8}
                r="1.2"
                fill={color}
                opacity={active ? 0.85 : 0.65}
              />
            );
          })}
        </>
      )}
      {style === "three-stone" && (
        <>
          <circle cx="12" cy="12" r="3.4" fill={color} opacity={active ? 0.95 : 0.8} />
          <circle cx="4.2" cy="12" r="2.2" fill={color} opacity={active ? 0.8 : 0.6} />
          <circle cx="19.8" cy="12" r="2.2" fill={color} opacity={active ? 0.8 : 0.6} />
        </>
      )}
    </svg>
  );
}

/* ---------- BAND STYLE ICON ---------- */
function BandIcon({ style, active }: { style: string; active: boolean }) {
  const color = active ? "#c9a96e" : "#666";
  const glow = active ? "drop-shadow(0 0 3px rgba(201,169,110,0.3))" : "none";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ filter: glow }}>
      <path d="M3 15 Q12 9 21 15" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity={active ? 0.95 : 0.8} />
      {style === "cathedral" && (
        <>
          <path d="M8 15 Q9 10 12 9" fill="none" stroke={color} strokeWidth="1.4" opacity={active ? 0.85 : 0.65} />
          <path d="M16 15 Q15 10 12 9" fill="none" stroke={color} strokeWidth="1.4" opacity={active ? 0.85 : 0.65} />
        </>
      )}
    </svg>
  );
}

/* ---------- METAL SWATCH ---------- */
function MetalSwatch({ metalKey }: { metalKey: string }) {
  const stops = metalSwatchStops[metalKey] || metalSwatchStops["yellow-gold"];
  return (
    <span
      className="block w-7 h-7 rounded-full border border-black/40 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${stops[0]}, ${stops[1]} 55%, ${stops[2]})`,
        boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35), 0 2px 6px rgba(0,0,0,0.4)",
      }}
    >
      <span
        className="absolute top-1 left-1.5 w-2.5 h-1.5 rounded-full opacity-50"
        style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.8), transparent)" }}
      />
    </span>
  );
}

/* ---------- GEM SWATCH ---------- */
function GemSwatch({ colorKey }: { colorKey: string }) {
  const [hi, base] = stoneGemStops[colorKey] || stoneGemStops.clear;
  return (
    <span
      className="block w-7 h-7 rounded-full border border-white/10 relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at 30% 25%, ${hi}, ${base} 70%)`,
        boxShadow: `0 2px 8px rgba(0,0,0,0.35), inset 0 -1px 2px rgba(0,0,0,0.3)`,
      }}
    >
      <span
        className="absolute top-1 left-1.5 w-2 h-1 rounded-full opacity-70"
        style={{ background: "rgba(255,255,255,0.9)" }}
      />
    </span>
  );
}

/* ---------- REFINED SLIDER ---------- */
function RefinedSlider({
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  leftLabel,
  rightLabel,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  formatValue: (v: number) => string;
  leftLabel: string;
  rightLabel: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative pt-8">
      <motion.div
        key={value}
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute top-0 -translate-x-1/2 text-[9px] tracking-[0.18em] text-[#c9a96e] font-serif italic whitespace-nowrap px-2.5 py-1 rounded-sm bg-[#c9a96e]/[0.07] border border-[#c9a96e]/15 backdrop-blur-sm"
        style={{ left: `${pct}%` }}
      >
        {formatValue(value)}
      </motion.div>
      <div className="relative h-1 flex items-center">
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a] to-[#1a1a1a] rounded-full" />
        <div
          className="absolute left-0 h-0.5 rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, rgba(201,169,110,0.4), #c9a96e)",
            boxShadow: "0 0 8px rgba(201,169,110,0.2)",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-6 opacity-0 absolute inset-0 cursor-pointer z-10"
        />
        <motion.div
          animate={{ left: `${pct}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute -translate-x-1/2 w-4 h-4 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 30%, #f0e0b8, #c9a96e 60%, #8a6c32)",
            border: "2px solid #0a0a0a",
            boxShadow: "0 0 0 1px rgba(201,169,110,0.3), 0 0 12px rgba(201,169,110,0.4), 0 2px 8px rgba(0,0,0,0.5)",
          }}
        />
      </div>
      <div className="flex justify-between mt-3.5">
        <span className="text-[8px] tracking-[0.18em] text-gray-700 uppercase">{leftLabel}</span>
        <span className="text-[8px] tracking-[0.18em] text-gray-700 uppercase">{rightLabel}</span>
      </div>
    </div>
  );
}

/* ---------- GENERIC PREVIEW FOR NON-RINGS ---------- */
function GenericPreview({ piece, config, category }: { piece: any; config: ConfigState; category: string }) {
  const [imgError, setImgError] = useState(false);

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`;
  };

  const imageUrl = getImageUrl(piece.hero_image_path);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <OrnateCorner position="top-left" />
      <OrnateCorner position="top-right" />
      <OrnateCorner position="bottom-left" />
      <OrnateCorner position="bottom-right" />
      {imageUrl && !imgError ? (
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 border border-[#c9a96e]/15 rounded-sm overflow-hidden">
          <Image
            src={imageUrl}
            alt={piece.name}
            fill
            className="object-cover opacity-85"
            unoptimized={false}
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
        </div>
      ) : (
        <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 border border-[#c9a96e]/15 flex flex-col items-center justify-center gap-2.5 rounded-sm">
          <span className="text-[#c9a96e]/40 text-xs tracking-[0.3em] uppercase">No Preview</span>
          {piece.hero_image_path && (
            <span className="text-[#1a3a5a] text-[9px] tracking-widest uppercase">
              {imgError ? "Image missing in storage" : "No image uploaded"}
            </span>
          )}
        </div>
      )}
      <div className="mt-8 sm:mt-10 space-y-2.5 text-center">
        <p className="text-[9px] text-[#c9a96e]/50 tracking-[0.3em] uppercase">{category} Configuration</p>
        {Object.entries(config).map(([key, val]) => {
          return (
            <p key={key} className="text-xs text-gray-500">
              <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, " $1")}: </span>
              <span className="text-[#c9a96e]/80">{val}</span>
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
      .map(([k, v]) => {
        const opt = catConfig.options.find((o) => o.key === k);
        const valLabel = opt?.values.find((v2) => v2.value === v)?.label || v;
        return `${opt?.label || k}: ${valLabel}`;
      })
      .join("\n");

    const data = {
      name,
      email,
      message: `Configuration Request for ${piece.name}\n\n${configLines}\n\nAdditional notes:\n${formData.get("message") || "None"}`,
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
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-[#c9a96e]/40 flex items-center justify-center bg-[#c9a96e]/[0.05]"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.div>
        <p className="text-[#c9a96e] font-serif text-2xl mb-2 tracking-wide">Request Received</p>
        <p className="text-gray-500 text-sm mb-7 leading-relaxed">A master jeweler will contact you within 24 hours.</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="text-xs text-gray-600 hover:text-[#c9a96e] transition-colors tracking-[0.3em] uppercase border-b border-[#1a1a1a] hover:border-[#c9a96e]/50 pb-1"
        >
          Return to Configuration
        </motion.button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-serif text-[#c9a96e] mb-1 tracking-wide">Commission</h2>
      <p className="text-sm text-gray-600 mb-6">{piece.name}</p>

      <div className="bg-gradient-to-b from-[#111] to-[#0c0c0c] border border-[#c9a96e]/12 p-4.5 mb-6 text-xs space-y-1.5 rounded-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/20 to-transparent" />
        <p className="text-gray-600 tracking-[0.3em] uppercase mb-3 text-[8px] flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[#c9a96e]" />
          Configuration Summary
        </p>
        {catConfig.options.map((opt) => {
          const val = config[opt.key];
          const valLabel = opt.values.find((v) => v.value === val)?.label || val;
          return (
            <div key={opt.key} className="flex justify-between py-0.5">
              <span className="text-gray-600 text-[10px]">{opt.label}</span>
              <span className="text-gray-400 text-[10px]">{valLabel}</span>
            </div>
          );
        })}
        <div className="flex justify-between pt-3 border-t border-[#c9a96e]/12 mt-1.5">
          <span className="text-gray-600 text-[10px] tracking-[0.1em]">Estimate</span>
          <span className="text-[#c9a96e] font-medium text-sm">
            {totalPrice === 0 ? "Upon Request" : `$${(totalPrice / 100).toLocaleString()}`}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[9px] text-gray-600 tracking-[0.25em] uppercase mb-1.5">
            Name <span className="text-[#c9a96e]">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-white focus:border-[#c9a96e]/50 focus:outline-none transition-all duration-300 text-sm rounded-sm focus:shadow-[0_0_0_3px_rgba(201,169,110,0.05)]"
          />
        </div>
        <div>
          <label className="block text-[9px] text-gray-600 tracking-[0.25em] uppercase mb-1.5">
            Email <span className="text-[#c9a96e]">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className={`w-full bg-[#111] border px-4 py-3 text-white focus:outline-none transition-all duration-300 text-sm rounded-sm ${
              emailError ? "border-red-900/60 focus:border-red-600/60 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.05)]" : "border-[#1a1a1a] focus:border-[#c9a96e]/50 focus:shadow-[0_0_0_3px_rgba(201,169,110,0.05)]"
            }`}
          />
          {emailError && <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{emailError}</p>}
        </div>
        <textarea
          name="message"
          rows={3}
          placeholder="Additional notes (optional)"
          className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-white focus:border-[#c9a96e]/50 focus:outline-none transition-all duration-300 text-sm resize-none rounded-sm focus:shadow-[0_0_0_3px_rgba(201,169,110,0.05)]"
        />
        {formError && !emailError && <p className="text-red-400/80 text-[10px] tracking-wide">{formError}</p>}
        <motion.button
          type="submit"
          disabled={formState === "submitting"}
          whileHover={{ scale: formState === "submitting" ? 1 : 1.01 }}
          whileTap={{ scale: formState === "submitting" ? 1 : 0.99 }}
          className="relative w-full py-3.5 overflow-hidden rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#c9a96e] via-[#d9bf89] to-[#c9a96e] bg-[length:200%_100%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          <span className="relative text-[#0a0a0a] tracking-[0.3em] text-xs uppercase font-semibold">
            {formState === "submitting" ? "Sending..." : "Submit Commission"}
          </span>
        </motion.button>
      </form>
    </>
  );
}