export type MetalId = "yellow-gold" | "rose-gold" | "platinum" | "blackened";
export type CutId = "round" | "oval" | "emerald" | "princess";
export type SettingId = "solitaire" | "halo" | "three-stone" | "pave";

// Atelier (lab-grown) atmospheres + Terra (natural) atmospheres share one
// union so both collections can pass an AtmosphereOption to RingCanvas.
export type AtmosphereId = "studio" | "boudoir" | "vault" | "quarry" | "dawn" | "dusk";

export type CollectionKind = "atelier" | "terra";

export interface MetalOption {
  id: MetalId;
  label: string;
  swatch: string;
  gradientStops: [string, string, string]; // highlight, mid, shadow
  multiplier: number;
}

export interface CutOption {
  id: CutId;
  label: string;
  carat: number;
  clarity: string;
  facets: number;
  multiplier: number;
}

export interface SettingOption {
  id: SettingId;
  label: string;
  description: string;
  multiplier: number;
}

export interface AtmosphereOption {
  id: AtmosphereId;
  label: string;
  description: string;
  backgroundFrom: string;
  backgroundTo: string;
  blendColor: string;
  blendMode: "color-dodge" | "overlay" | "soft-light";
}

export const METALS: MetalOption[] = [
  {
    id: "yellow-gold",
    label: "Yellow Gold",
    swatch: "#C9A66B",
    gradientStops: ["#F3DFA6", "#C9A66B", "#8A6A34"],
    multiplier: 1,
  },
  {
    id: "rose-gold",
    label: "Rose Gold",
    swatch: "#D9A79C",
    gradientStops: ["#F2CFC3", "#D9A79C", "#9C6459"],
    multiplier: 1.04,
  },
  {
    id: "platinum",
    label: "Platinum",
    swatch: "#D9D6D0",
    gradientStops: ["#F5F4F1", "#C9C6BF", "#8E8B85"],
    multiplier: 1.32,
  },
  {
    id: "blackened",
    label: "Blackened Steel",
    swatch: "#3A3A3D",
    gradientStops: ["#6B6B70", "#3A3A3D", "#131315"],
    multiplier: 1.18,
  },
];

// Atelier = lab-grown / engineered stones.
export const CUTS: CutOption[] = [
  { id: "round", label: "Round Brilliant", carat: 1.42, clarity: "VS1", facets: 8, multiplier: 1 },
  { id: "oval", label: "Oval", carat: 1.78, clarity: "VVS2", facets: 6, multiplier: 1.12 },
  { id: "emerald", label: "Emerald", carat: 2.05, clarity: "VS2", facets: 4, multiplier: 1.2 },
  { id: "princess", label: "Princess", carat: 1.61, clarity: "VVS1", facets: 4, multiplier: 1.08 },
];

export const SETTINGS: SettingOption[] = [
  { id: "solitaire", label: "Solitaire", description: "One stone, four prongs, nothing else asking for attention.", multiplier: 1 },
  { id: "halo", label: "Halo", description: "A pavé ring of small stones tightens the light around the center.", multiplier: 1.22 },
  { id: "three-stone", label: "Three-Stone", description: "A past, present, and future stone, set in a single line.", multiplier: 1.35 },
  { id: "pave", label: "Pavé Band", description: "Small stones set the full length of the band.", multiplier: 1.15 },
];

export const ATMOSPHERES: AtmosphereOption[] = [
  {
    id: "studio",
    label: "Studio",
    description: "Cool, even, clinical light. How the piece reads under a loupe.",
    backgroundFrom: "#1C1A17",
    backgroundTo: "#0C0A08",
    blendColor: "#DCE6EA",
    blendMode: "soft-light",
  },
  {
    id: "boudoir",
    label: "Boudoir",
    description: "Low, warm, close light. How the piece reads across a dinner table.",
    backgroundFrom: "#241512",
    backgroundTo: "#0C0A08",
    blendColor: "#6B1E20",
    blendMode: "color-dodge",
  },
  {
    id: "vault",
    label: "Vault",
    description: "A single hard spotlight in the dark. How the piece reads alone.",
    backgroundFrom: "#0A0B0D",
    backgroundTo: "#000000",
    blendColor: "#C9A66B",
    blendMode: "overlay",
  },
];

// deterministic string hash -> used to seed the "jitter" so the same
// configuration always assays to the same certificate, but every
// combination reads as independently appraised rather than formulaic.
export function seededFraction(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

export interface Assay {
  carat: string;
  cutLabel: string;
  clarity: string;
  estValue: string;
  certId: string;
}

const BASE_VALUE_PER_CARAT = 14200;

export function computeAssay(metal: MetalOption, cut: CutOption, setting: SettingOption): Assay {
  const seed = `${metal.id}:${cut.id}:${setting.id}`;
  const jitter = 0.94 + seededFraction(seed) * 0.12; // 0.94–1.06
  const raw =
    cut.carat * BASE_VALUE_PER_CARAT * metal.multiplier * cut.multiplier * setting.multiplier * jitter;
  const rounded = Math.round(raw / 50) * 50;

  const certSeed = Math.floor(seededFraction(seed + ":cert") * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");

  return {
    carat: cut.carat.toFixed(2),
    cutLabel: cut.label.toUpperCase(),
    clarity: cut.clarity,
    estValue: rounded.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    certId: `MDX-${certSeed}-${setting.id.slice(0, 2).toUpperCase()}`,
  };
}