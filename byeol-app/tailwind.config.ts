import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "deep-space": "var(--deep-space)",
        "void": "var(--void)",
        "nebula": "var(--nebula)",
        "star-pink": "var(--star-pink)",
        "star-violet": "var(--star-violet)",
        "star-cyan": "var(--star-cyan)",
        "star-gold": "var(--star-gold)",
        "star-rose": "var(--star-rose)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-ghost": "var(--text-ghost)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Outfit", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      animation: {
        "light-streak": "lightStreak 8s ease-in-out infinite",
        "pulse-badge": "pulse 2s infinite",
        "avatar-glow": "avatarGlow 3s ease-in-out infinite",
        "blink": "blink 2s infinite",
        "typing": "typingBounce 1.4s infinite ease-in-out both",
        "slide-up": "slideUp 0.6s ease-out",
        "toast-in": "toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-out": "toastOut 0.3s ease forwards",
        "modal-in": "modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "sparkle": "sparkleTrail 1.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
