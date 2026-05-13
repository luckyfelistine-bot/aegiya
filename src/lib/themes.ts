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
  swatch: string;    // CSS gradient or solid color for preview swatch
}

export const builtInThemes: Theme[] = [
  {
    name: "Mystic Pink (Default)",
    primary: "#ec4899",
    secondary: "#fbcfe8",
    surface: "#fdf2f8",
    text: "#831843",
    border: "#f9a8d4",
    swatch: "linear-gradient(135deg, #ec4899, #fbcfe8)"
  },
  {
    name: "Purple Night",
    primary: "#a855f7",
    secondary: "#ede9fe",
    surface: "#f5f3ff",
    text: "#4c1d95",
    border: "#c4b5fd",
    swatch: "linear-gradient(135deg, #a855f7, #ede9fe)"
  },
  {
    name: "Ocean Calm",
    primary: "#0ea5e9",
    secondary: "#e0f2fe",
    surface: "#f0f9ff",
    text: "#0c4a6e",
    border: "#7dd3fc",
    swatch: "linear-gradient(135deg, #0ea5e9, #e0f2fe)"
  },
  {
    name: "Sunset Glow",
    primary: "#f97316",
    secondary: "#ffedd5",
    surface: "#fff7ed",
    text: "#7c2d12",
    border: "#fdba74",
    swatch: "linear-gradient(135deg, #f97316, #ffedd5)"
  },
  {
    name: "Mint Forest",
    primary: "#10b981",
    secondary: "#d1fae5",
    surface: "#ecfdf5",
    text: "#064e3b",
    border: "#6ee7b7",
    swatch: "linear-gradient(135deg, #10b981, #d1fae5)"
  },
  {
    name: "Dark Star (Night Owl)",
    primary: "#f472b6",
    secondary: "#1e1b4b",
    surface: "#111827",
    text: "#f3f4f6",
    border: "#334155",
    swatch: "linear-gradient(135deg, #f472b6, #1e1b4b)"
  },
  {
    name: "Cream Rose",
    primary: "#f43f5e",
    secondary: "#ffe4e6",
    surface: "#fff1f2",
    text: "#881337",
    border: "#fda4af",
    swatch: "linear-gradient(135deg, #f43f5e, #ffe4e6)"
  },
  {
    name: "Lavender Dream",
    primary: "#8b5cf6",
    secondary: "#e9d5ff",
    surface: "#f5f3ff",
    text: "#4c1d95",
    border: "#c4b5fd",
    swatch: "linear-gradient(135deg, #8b5cf6, #e9d5ff)"
  }
];

// Alias for ThemePicker (which imports 'constellations')
export const constellations = builtInThemes;

export function getDefaultTheme(): Theme {
  return builtInThemes[0];
}
