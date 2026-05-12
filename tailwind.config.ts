import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        surface: "var(--surface)",
        text: "var(--text)",
        border: "var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;
