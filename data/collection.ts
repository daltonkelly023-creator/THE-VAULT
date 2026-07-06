export interface JewelryPiece {
  id: string;
  name: string;
  price: string;
  material: string;
  stone: string;
  carat: string;
  story: string;
  specifications: string[];
}

// No product photography yet — pieces render on PiecePlaceholder until
// real images (or renders) are uploaded. See components/PiecePlaceholder.tsx.
export const VAULT_COLLECTION: JewelryPiece[] = [
  {
    id: "obsidian-solitaire",
    name: "The Obsidian Solitaire",
    price: "$4,850",
    material: "18k Solid Yellow Gold",
    stone: "VVS1 Diamond",
    carat: "1.65 ct",
    story:
      "A single stone, tension-set into a solid gold band cut to hold it and nothing else. Built to catch light from every angle, not to compete with it.",
    specifications: [
      "Individually engraved serial number",
      "Tension-set mounting",
      "Leather presentation case included",
    ],
  },
  {
    id: "aurum-sculptural-cuff",
    name: "Aurum Sculptural Cuff",
    price: "$7,200",
    material: "24k Vermeil over Solid Silver",
    stone: "None — polished metal only",
    carat: "N/A",
    story:
      "No stone, no setting — just metal, shaped and mirror-polished until the surface does the work. Forty-eight hours of hand-finishing for a line that holds its shape from any angle.",
    specifications: [
      "Spring-hinge closure",
      "Reinforced inner core",
      "Studio hallmark stamped for purity",
    ],
  },
  {
    id: "lumina-drop-pendants",
    name: "Lumina Cascade Drops",
    price: "$9,100",
    material: "18k Polished White Gold",
    stone: "Emerald-Cut Diamonds",
    carat: "3.10 ct Total Weight",
    story:
      "Matched emerald-cut stones, hung on a chain fine enough to disappear. Set to fall just below the collarbone and stay there.",
    specifications: [
      "Mechanical security clasp",
      "Micro-pavé along each drop",
      "Gemological dossier included",
    ],
  },
];