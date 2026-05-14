"use client";

import { useState, useRef, useEffect } from "react";
import { PaletteIcon, CheckIcon } from "@/components/SvgIcons";

interface ThemePickerProps {
  value?: string;
  onChange?: (theme: string) => void;
}

const themes = [
  { id: "andromeda", name: "Andromeda", subtitle: "First Date", gradient: "linear-gradient(135deg, #ff6b9d, #ffd700)" },
  { id: "orion", name: "Orion", subtitle: "Late Nights", gradient: "linear-gradient(135deg, #60a5fa, #22d3ee)" },
  { id: "cassiopeia", name: "Cassiopeia", subtitle: "Cozy Comfort", gradient: "linear-gradient(135deg, #f472b6, #c084fc)" },
  { id: "lyra", name: "Lyra", subtitle: "Celebration", gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)" },
  { id: "cygnus", name: "Cygnus", subtitle: "Moonlight", gradient: "linear-gradient(135deg, #34d399, #a78bfa)" },
  { id: "nebula", name: "Nebula", subtitle: "Mystic", gradient: "linear-gradient(135deg, #c084fc, #f472b6)" },
  { id: "supernova", name: "Supernova", subtitle: "Explosive", gradient: "linear-gradient(135deg, #fb923c, #f87171)" },
  { id: "event-horizon", name: "Event Horizon", subtitle: "Dark", gradient: "linear-gradient(135deg, #2dd4bf, #4ade80)" },
  { id: "moonlight", name: "Moonlight", subtitle: "Silvery", gradient: "linear-gradient(135deg, #e2e8f0, #94a3b8)" },
  { id: "sunset", name: "Sunset", subtitle: "Warm", gradient: "linear-gradient(135deg, #ff7e5f, #feb47b)" },
  { id: "aurora", name: "Aurora", subtitle: "Glow", gradient: "linear-gradient(135deg, #00c6ff, #0072ff)" },
  { id: "cosmic-latte", name: "Cosmic Latte", subtitle: "Soft", gradient: "linear-gradient(135deg, #f5e6d3, #d4a5a5)" },
];

export default function ThemePicker({ value, onChange }: ThemePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [internalTheme, setInternalTheme] = useState(value || themes[0].id);

  useEffect(() => {
    if (value && value !== internalTheme) {
      setInternalTheme(value);
    }
  }, [value, internalTheme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleThemeSelect = (themeId: string) => {
    setInternalTheme(themeId);
    if (onChange) onChange(themeId);
    setIsOpen(false);
  };

  return (
    <div className="theme-switcher" ref={dropdownRef}>
      <button
        className="theme-btn glass-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change constellation theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <PaletteIcon size={18} />
      </button>

      {isOpen && (
        <div
          className="theme-dropdown glass-strong"
          role="listbox"
          aria-label="Theme options"
        >
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${internalTheme === theme.id ? "active" : ""}`}
              onClick={() => handleThemeSelect(theme.id)}
              role="option"
              aria-selected={internalTheme === theme.id}
            >
              <div className="theme-swatch" style={{ background: theme.gradient }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontWeight: 600 }}>{theme.name}</span>
                <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{theme.subtitle}</span>
              </div>
              {internalTheme === theme.id && <CheckIcon size={14} style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
