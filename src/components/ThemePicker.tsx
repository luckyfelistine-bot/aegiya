"use client";

import { useState, useRef, useEffect } from "react";
import { themes, type Theme } from "@/lib/themes";
import { useTheme, type ThemeId } from "@/hooks/useTheme";
import { PaletteIcon, CheckIcon } from "./SvgIcons";

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = async (themeId: ThemeId) => {
    await setCurrentTheme(themeId);
    setOpen(false);
  };

  return (
    <div ref={ref} className="theme-switcher">
      <button
        className="theme-btn"
        onClick={() => setOpen(!open)}
        aria-label="Change theme"
      >
        <PaletteIcon size={18} />
        <span>Themes</span>
      </button>
      {open && (
        <div className="theme-dropdown">
          <div style={{ padding: "4px 4px 8px", borderBottom: "1px solid var(--glass-border)", marginBottom: 6 }}>
            <p style={{ fontSize: "0.7rem", color: "var(--lunar)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Choose your vibe
            </p>
          </div>
          {themes.map((theme) => {
            const isActive = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                className={`theme-option ${isActive ? "active" : ""}`}
                onClick={() => handleSelect(theme.id as ThemeId)}
              >
                <div
                  className="theme-swatch"
                  style={{ background: theme.swatch }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{theme.label}</span>
                  <span style={{ fontSize: "0.72rem", opacity: 0.5 }}>{theme.mood}</span>
                </div>
                {isActive && <CheckIcon size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
