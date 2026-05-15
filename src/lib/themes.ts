/**
 * themes.ts
 * Defines a palette of beautiful themes, with pink/purple as defaults,
 * and allows full customization.
 */

export interface Theme {
  id: string;
  name: string;
  label: string;
  mood: string;
  primary: string;
  secondary: string;
  accent: string;
  swatch: string;
}

export const themes: Theme[] = [
  {
    id: "cosmic",
    name: "Cosmic Purple",
    label: "Cosmic Purple",
    mood: "Mystical & Deep",
    primary: "#c084fc",
    secondary: "#00d4ff",
    accent: "#ff6b9d",
    swatch: "linear-gradient(135deg, #c084fc, #00d4ff, #ff6b9d)",
  },
  {
    id: "aurora",
    name: "Aurora Borealis",
    label: "Aurora",
    mood: "Ethereal & Calm",
    primary: "#22d3ee",
    secondary: "#a78bfa",
    accent: "#f472b6",
    swatch: "linear-gradient(135deg, #22d3ee, #a78bfa, #f472b6)",
  },
  {
    id: "nebula",
    name: "Nebula Violet",
    label: "Nebula",
    mood: "Dreamy & Mysterious",
    primary: "#a855f7",
    secondary: "#2dd4bf",
    accent: "#fb7185",
    swatch: "linear-gradient(135deg, #a855f7, #2dd4bf, #fb7185)",
  },
  {
    id: "solar",
    name: "Solar Flare",
    label: "Solar",
    mood: "Warm & Energetic",
    primary: "#f59e0b",
    secondary: "#f97316",
    accent: "#ef4444",
    swatch: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444)",
  },
  {
    id: "lunar",
    name: "Lunar Silver",
    label: "Lunar",
    mood: "Serene & Quiet",
    primary: "#94a3b8",
    secondary: "#cbd5e1",
    accent: "#e879f9",
    swatch: "linear-gradient(135deg, #94a3b8, #cbd5e1, #e879f9)",
  },
  {
    id: "oceanic",
    name: "Oceanic Blue",
    label: "Oceanic",
    mood: "Deep & Flowing",
    primary: "#0ea5e9",
    secondary: "#38bdf8",
    accent: "#818cf8",
    swatch: "linear-gradient(135deg, #0ea5e9, #38bdf8, #818cf8)",
  },
  {
    id: "rose",
    name: "Rose Garden",
    label: "Rose",
    mood: "Romantic & Soft",
    primary: "#f43f5e",
    secondary: "#fb7185",
    accent: "#fda4af",
    swatch: "linear-gradient(135deg, #f43f5e, #fb7185, #fda4af)",
  },
  {
    id: "forest",
    name: "Forest Green",
    label: "Forest",
    mood: "Fresh & Natural",
    primary: "#10b981",
    secondary: "#34d399",
    accent: "#a3e635",
    swatch: "linear-gradient(135deg, #10b981, #34d399, #a3e635)",
  },
  {
    id: "golden",
    name: "Golden Hour",
    label: "Golden",
    mood: "Warm & Rich",
    primary: "#eab308",
    secondary: "#facc15",
    accent: "#fb923c",
    swatch: "linear-gradient(135deg, #eab308, #facc15, #fb923c)",
  },
  {
    id: "midnight",
    name: "Midnight Indigo",
    label: "Midnight",
    mood: "Deep & Cool",
    primary: "#6366f1",
    secondary: "#818cf8",
    accent: "#c084fc",
    swatch: "linear-gradient(135deg, #6366f1, #818cf8, #c084fc)",
  },
  {
    id: "cherry",
    name: "Cherry Blossom",
    label: "Cherry",
    mood: "Delicate & Sweet",
    primary: "#e11d48",
    secondary: "#fb7185",
    accent: "#fda4af",
    swatch: "linear-gradient(135deg, #e11d48, #fb7185, #fda4af)",
  },
  {
    id: "mint",
    name: "Mint Fresh",
    label: "Mint",
    mood: "Crisp & Clean",
    primary: "#14b8a6",
    secondary: "#2dd4bf",
    accent: "#a7f3d0",
    swatch: "linear-gradient(135deg, #14b8a6, #2dd4bf, #a7f3d0)",
  },
  {
    id: "coral",
    name: "Coral Reef",
    label: "Coral",
    mood: "Vibrant & Lively",
    primary: "#f97316",
    secondary: "#fdba74",
    accent: "#fb923c",
    swatch: "linear-gradient(135deg, #f97316, #fdba74, #fb923c)",
  },
  {
    id: "lavender",
    name: "Lavender Fields",
    label: "Lavender",
    mood: "Calm & Dreamy",
    primary: "#8b5cf6",
    secondary: "#a78bfa",
    accent: "#c4b5fd",
    swatch: "linear-gradient(135deg, #8b5cf6, #a78bfa, #c4b5fd)",
  },
  {
    id: "peach",
    name: "Peach Sunset",
    label: "Peach",
    mood: "Warm & Gentle",
    primary: "#f472b6",
    secondary: "#fbcfe8",
    accent: "#fde68a",
    swatch: "linear-gradient(135deg, #f472b6, #fbcfe8, #fde68a)",
  },
];

// Backward compatibility aliases
export const constellations = themes;
export const builtInThemes = themes;

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) || themes[0];
}
