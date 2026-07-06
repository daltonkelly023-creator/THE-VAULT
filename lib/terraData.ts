import { CutId, CutOption, AtmosphereOption, MetalOption, SettingOption, seededFraction } from "./ringData";

/**
 * Terra = natural, mined stones. Deliberately NOT a retint of Atelier's
 * CUTS — natural stones at this price band run smaller carat than
 * lab-grown, and clarity typically reads a grade or two further from
 * flawless. These multipliers/grades are illustrative starting values;
 * swap in real invoicing/appraisal figures before this goes live for
 * actual sales, since carat-for-carat natural stone pricing varies a lot
 * by source and this is not sourced market data.
 */
export const TERRA_CUTS: CutOption[] = [
  { id: "round" as CutId, label: "Round Brilliant", carat: 0.91, clarity: "SI1", facets: 8, multiplier: 1 },
  { id: "oval" as CutId, label: "Oval", carat: 1.08, clarity: "VS2", facets: 6, multiplier: 1.15 },
  { id: "emerald" as CutId, label: "Emerald", carat: 1.24, clarity: "SI2", facets: 4, multiplier: 1.18 },
  { id: "princess" as CutId, label: "Princess", carat: 1.02, clarity: "VS1", facets: 4, multiplier: 1.1 },
];

// Roughly when a stone of this cut's typical source deposit formed.
// Marketing copy, not a certified provenance claim.
export const TERRA_FORMATION_AGE: Record<CutId, string> = {
  round: "~1.1 billion years",
  oval: "~2.5 billion years",
  emerald: "~500 million years",
  princess: "~1.8 billion years",
};

export const TERRA_ATMOSPHERES: AtmosphereOption[] = [
  {
    id: "quarry",
    label: "Quarry",
    description: "Flat overcast light, the kind you'd find the stone by.",
    backgroundFrom: "#1C1712",
    backgroundTo: "#0E0B08",
    blendColor: "#8C6F4F",
    blendMode: "soft-light",
  },
  {
    id: "dawn",
    label: "Dawn",
    description: "Low sun across open ground. Long shadows, warm ochre.",
    backgroundFrom: "#3D2F22",
    backgroundTo: "#120D08",
    blendColor: "#B99B72",
    blendMode: "overlay",
  },
  {
    id: "dusk",
    label: "Dusk",
    description: "The last light before the site goes dark for the night.",
    backgroundFrom: "#231C1A",
    backgroundTo: "#0A0807",
    blendColor: "#5C6B4F",
    blendMode: "color-dodge",
  },
];

const NATURAL_BASE_VALUE_PER_CARAT = 21800;

export interface TerraAssay {
  carat: string;
  cutLabel: string;
  clarity: string;
  estValue: string;
  formationAge: string;
  provenanceId: string;
}

export function computeTerraAssay(
  metal: MetalOption,
  cut: CutOption,
  setting: SettingOption
): TerraAssay {
  const seed = `terra:${metal.id}:${cut.id}:${setting.id}`;
  const jitter = 0.9 + seededFraction(seed) * 0.2; // natural stones jitter a bit more than lab-grown
  const raw =
    cut.carat * NATURAL_BASE_VALUE_PER_CARAT * metal.multiplier * cut.multiplier * setting.multiplier * jitter;
  const rounded = Math.round(raw / 50) * 50;

  const provSeed = Math.floor(seededFraction(seed + ":prov") * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");

  return {
    carat: cut.carat.toFixed(2),
    cutLabel: cut.label.toUpperCase(),
    clarity: cut.clarity,
    estValue: rounded.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    formationAge: TERRA_FORMATION_AGE[cut.id],
    provenanceId: `TRA-${provSeed}-${setting.id.slice(0, 2).toUpperCase()}`,
  };
}