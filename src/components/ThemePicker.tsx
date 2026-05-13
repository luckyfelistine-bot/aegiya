"use client";

import { useState, useRef, useEffect } from "react";
import {
  PaletteIcon,
  CheckIcon,
} from "@/components/SvgIcons";

interface ThemePickerProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const themes = [
  {
    id: "andromeda",
    name: "Andromeda",
    subtitle: "First Date",
    gradient: "linear-gradient(135deg, #ff6b9d, #ffd700)",
  },
  {
    id: "orion",
    name: "Orion",
    subtitle: "Late Nights",
    gradient: "linear-gradient(135deg, #60a5fa, #22d3ee)",
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    subtitle: "Cozy Comfort",
    gradient: "linear-gradient(135deg, #f472b6, #c084fc)",
  },
  {
    id: "lyra",
    name: "Lyra",
    subtitle: "Celebration",
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
  },
  {
    id: "cygnus",
    name: "Cygnus",
    subtitle: "Moonlight",
    gradient: "linear-gradient(135deg, #34d399, #a78bfa)",
  },
];

export default function ThemePicker({ currentTheme, onThemeChange }: ThemePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="theme-switcher" ref={dropdownRef}>
      <button
        className="theme-btn glass-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change constellation theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <PaletteIcon />
      </button>

      <div
        className={`theme-dropdown glass-strong ${isOpen ? "open" : ""}`}
        role="listbox"
        aria-label="Theme options"
      >
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`theme-option ${currentTheme === theme.id ? "active" : ""}`}
            onClick={() => {
              onThemeChange(theme.id);
              setIsOpen(false);
            }}
            role="option"
            aria-selected={currentTheme === theme.id}
          >
            <div
              className="theme-swatch"
              style={{ background: theme.gradient }}
            />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontWeight: 600 }}>{theme.name}</span>
              <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{theme.subtitle}</span>
            </div>
            {currentTheme === theme.id && (
              <CheckIcon style={{ marginLeft: "auto", width: 16, height: 16 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
