/* src/app/globals.css */

/* ── CSS Variables & Theme System ── */
:root {
  /* Typography */
  --font-display: "Outfit", "Inter", system-ui, sans-serif;
  --font-body: "Inter", "Segoe UI", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Default Theme: Cosmic Void */
  --void: #050510;
  --nebula: #0a0a1e;
  --starlight: #e8e8ff;
  --aurora: #7c3aed;
  --comet: #06b6d4;
  --eclipse: #1e1b4b;
  --lunar: #c084fc;
  --solar: #f59e0b;

  /* Glass Surfaces */
  --glass: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-highlight: rgba(255, 255, 255, 0.12);

  /* Accents */
  --accent: #8b5cf6;
  --accent-glow: rgba(139, 92, 246, 0.4);

  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;

  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* Radii */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-glow: 0 0 20px var(--accent-glow);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-inner: inset 0 1px 0 var(--glass-highlight);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Theme Variants ── */
[data-theme="aurora"] {
  --void: #0a0a1a;
  --nebula: #1a1a3e;
  --aurora: #ec4899;
  --comet: #22d3ee;
  --accent: #ec4899;
  --accent-glow: rgba(236, 72, 153, 0.4);
}

[data-theme="nebula"] {
  --void: #0d0d1f;
  --nebula: #1e1e4a;
  --aurora: #a855f7;
  --comet: #2dd4bf;
  --accent: #a855f7;
  --accent-glow: rgba(168, 85, 247, 0.4);
}

[data-theme="solar"] {
  --void: #1a0a00;
  --nebula: #2d1b0e;
  --starlight: #fff7ed;
  --aurora: #f97316;
  --comet: #fbbf24;
  --accent: #f97316;
  --accent-glow: rgba(249, 115, 22, 0.4);
}

[data-theme="lunar"] {
  --void: #0a0a0a;
  --nebula: #171717;
  --starlight: #f5f5f5;
  --aurora: #a3a3a3;
  --comet: #d4d4d8;
  --accent: #e5e5e5;
  --accent-glow: rgba(229, 229, 229, 0.3);
}

[data-theme="oceanic"] {
  --void: #00111a;
  --nebula: #002233;
  --aurora: #0ea5e9;
  --comet: #22d3ee;
  --accent: #0ea5e9;
  --accent-glow: rgba(14, 165, 233, 0.4);
}

[data-theme="rose"] {
  --void: #1a050a;
  --nebula: #2d0f1a;
  --aurora: #f43f5e;
  --comet: #fda4af;
  --accent: #f43f5e;
  --accent-glow: rgba(244, 63, 94, 0.4);
}

[data-theme="forest"] {
  --void: #051a0a;
  --nebula: #0f2d1a;
  --aurora: #22c55e;
  --comet: #86efac;
  --accent: #22c55e;
  --accent-glow: rgba(34, 197, 94, 0.4);
}

[data-theme="golden"] {
  --void: #1a1505;
  --nebula: #2d2610;
  --aurora: #eab308;
  --comet: #fde047;
  --accent: #eab308;
  --accent-glow: rgba(234, 179, 8, 0.4);
}

/* ── Reset & Base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  background-color: var(--void);
  color: var(--starlight);
  overflow: hidden;
  min-height: 100vh;
  min-height: 100dvh;
}

/* ── Scrollbar ── */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--glass-highlight);
}

/* ── Selection ── */
::selection {
  background: var(--accent);
  color: var(--void);
}

/* ── Glassmorphism Utilities ── */
.glass-panel {
  background: var(--glass);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-inner), var(--shadow-elevated);
  border-radius: var(--radius-lg);
}

.glass-surface {
  background: var(--glass);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.glass-button {
  background: var(--glass);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  color: var(--starlight);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
}

.glass-button:hover {
  background: var(--glass-highlight);
  border-color: var(--accent);
  box-shadow: 0 0 16px var(--accent-glow);
  transform: translateY(-1px);
}

.glass-button:active {
  transform: translateY(0);
}

.glass-input {
  background: var(--glass);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  color: var(--starlight);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-body);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
  outline: none;
  width: 100%;
}

.glass-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-glow);
}

.glass-input::placeholder {
  color: rgba(232, 232, 255, 0.4);
}

/* ── Neon Glow Text ── */
.neon-text {
  text-shadow: 0 0 10px var(--accent-glow), 0 0 20px var(--accent-glow);
}

/* ── Liquid Glass Effect (SVG Filter) ── */
.liquid-glass {
  position: relative;
  overflow: hidden;
}

.liquid-glass::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
  border-radius: inherit;
}

.liquid-glass::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.2) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* ── Animations ── */
@keyframes cosmicPulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

@keyframes shootingStar {
  0% {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateX(300px) translateY(300px);
    opacity: 0;
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* ── Responsive Utilities ── */
@media (max-width: 768px) {
  .glass-panel {
    border-radius: var(--radius-md);
  }
}

/* ── Reduced Motion ── */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ── Focus Visible ── */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ── Code Block Styling ── */
pre {
  background: var(--eclipse) !important;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.6;
}

code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  background: var(--eclipse);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  color: var(--comet);
}

pre code {
  background: transparent;
  padding: 0;
}

/* ── Utility Classes ── */
.text-gradient {
  background: linear-gradient(135deg, var(--aurora), var(--comet));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bg-gradient-cosmic {
  background: linear-gradient(180deg, var(--void) 0%, var(--nebula) 50%, var(--eclipse) 100%);
}

.border-glow {
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

/* ── Hide scrollbar but keep functionality ── */
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
