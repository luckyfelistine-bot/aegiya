"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { builtInThemes, Theme, getDefaultTheme } from "@/lib/themes";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>(null!);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getDefaultTheme());

  useEffect(() => {
    const saved = localStorage.getItem("byeol-theme");
    if (saved) {
      try {
        setTheme(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--surface", theme.surface);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--border", theme.border);
    localStorage.setItem("byeol-theme", JSON.stringify(theme));
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeSwitcher />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-white/80 p-2 shadow-lg backdrop-blur"
        aria-label="Change theme"
      >
        🎨
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white p-2 shadow-xl">
          {builtInThemes.map((t) => (
            <button
              key={t.name}
              onClick={() => { setTheme(t); setOpen(false); }}
              className={`block w-full text-left p-2 rounded ${
                theme.name === t.name ? "bg-pink-100 font-bold" : "hover:bg-gray-100"
              }`}
            >
              <span className="inline-block w-4 h-4 rounded-full mr-2" style={{ background: t.primary }}></span>
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
