/**
 * themes.ts
 * Defines a palette of beautiful themes, with pink/purple as defaults,
 * and allows full customization.
 */

export interface Theme {
  name: string;
  primary: string;   // main accent
  secondary: string; // background panels
  surface: string;   // chat bubbles
  text: string;
  border: string;
}

export const builtInThemes: Theme[] = [
  {
    name: "Mystic Pink (Default)",
    primary: "#ec4899", // pink-500
    secondary: "#fbcfe8", // pink-100
    surface: "#fdf2f8", // pink-50
    text: "#831843",
    border: "#f9a8d4"
  },
  {
    name: "Purple Night",
    primary: "#a855f7",
    secondary: "#ede9fe",
    surface: "#f5f3ff",
    text: "#4c1d95",
    border: "#c4b5fd"
  },
  {
    name: "Ocean Calm",
    primary: "#0ea5e9",
    secondary: "#e0f2fe",
    surface: "#f0f9ff",
    text: "#0c4a6e",
    border: "#7dd3fc"
  },
  {
    name: "Sunset Glow",
    primary: "#f97316",
    secondary: "#ffedd5",
    surface: "#fff7ed",
    text: "#7c2d12",
    border: "#fdba74"
  },
  {
    name: "Mint Forest",
    primary: "#10b981",
    secondary: "#d1fae5",
    surface: "#ecfdf5",
    text: "#064e3b",
    border: "#6ee7b7"
  },
  {
    name: "Dark Star (Night Owl)",
    primary: "#f472b6", // pink-400
    secondary: "#1e1b4b", // deep indigo
    surface: "#111827",
    text: "#f3f4f6",
    border: "#334155"
  },
  {
    name: "Cream Rose",
    primary: "#f43f5e",
    secondary: "#ffe4e6",
    surface: "#fff1f2",
    text: "#881337",
    border: "#fda4af"
  },
  {
    name: "Lavender Dream",
    primary: "#8b5cf6",
    secondary: "#e9d5ff",
    surface: "#f5f3ff",
    text: "#4c1d95",
    border: "#c4b5fd"
  }
];

// ✅ This alias is needed because ThemePicker.tsx imports 'constellations'
export const constellations = builtInThemes;

export function getDefaultTheme(): Theme {
  return builtInThemes[0]; // Mystic Pink
}
