"use client";

import React, { useState, useEffect } from "react";
import { constellations } from "@/lib/themes";
import { PaletteIcon } from "./SvgIcons";

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("andromeda");

  useEffect(() => {
    const saved = localStorage.getItem("byeol-theme");
    if (saved) {
      setCurrent(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const setTheme = (name: string) => {
    document.documentElement.setAttribute("data-theme", name);
    setCurrent(name);
    localStorage.setItem("byeol-theme", name);
    setOpen(false);
  };

  return (
    <div className="theme-switcher">
      <button
        className="theme-btn glass-sm"
        onClick={() => setOpen(!open)}
        aria-label="Change constellation theme"
      >
        <PaletteIcon size={18} />
      </button>
      {open && (
        <div className="theme-dropdown glass-strong">
          {constellations.map((t) => (
            <button
              key={t.name}
              className={`theme-option ${current === t.name ? "active" : ""}`}
              onClick={() => setTheme(t.name)}
            >
              <div
                className="theme-swatch"
                style={{ background: t.swatch }}
              />
              <div>
                <div>{t.label}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t.mood}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
