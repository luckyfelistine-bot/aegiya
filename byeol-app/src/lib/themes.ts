export interface Theme {
  name: string;
  label: string;
  mood: string;
  primary: string;
  secondary: string;
  accent: string;
  swatch: string;
}

export const constellations: Theme[] = [
  {
    name: 'andromeda',
    label: 'Andromeda',
    mood: 'First Date',
    primary: '#ff6b9d',
    secondary: '#ffd700',
    accent: '#a855f7',
    swatch: 'linear-gradient(135deg, #ff6b9d, #ffd700)',
  },
  {
    name: 'orion',
    label: 'Orion',
    mood: 'Late Nights',
    primary: '#60a5fa',
    secondary: '#22d3ee',
    accent: '#818cf8',
    swatch: 'linear-gradient(135deg, #60a5fa, #22d3ee)',
  },
  {
    name: 'cassiopeia',
    label: 'Cassiopeia',
    mood: 'Cozy Comfort',
    primary: '#f472b6',
    secondary: '#c084fc',
    accent: '#fda4af',
    swatch: 'linear-gradient(135deg, #f472b6, #c084fc)',
  },
  {
    name: 'lyra',
    label: 'Lyra',
    mood: 'Celebration',
    primary: '#fbbf24',
    secondary: '#f59e0b',
    accent: '#fef3c7',
    swatch: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  },
  {
    name: 'cygnus',
    label: 'Cygnus',
    mood: 'Moonlight',
    primary: '#34d399',
    secondary: '#a78bfa',
    accent: '#e2e8f0',
    swatch: 'linear-gradient(135deg, #34d399, #a78bfa)',
  },
];

export function getDefaultTheme(): Theme {
  return constellations[0];
}
