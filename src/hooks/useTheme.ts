// src/hooks/useTheme.ts
"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Available theme IDs
 */
export type ThemeId =
  | "cosmic"
  | "aurora"
  | "nebula"
  | "solar"
  | "lunar"
  | "oceanic"
  | "rose"
  | "forest"
  | "golden";

/**
 * useTheme - React hook for managing application theme
 * Syncs with data-theme attribute and IndexedDB
 * @returns [currentTheme, setTheme, isLoading]
 */
export function useTheme(): [ThemeId, (theme: ThemeId) => Promise<void>, boolean] {
  const [theme, setThemeState] = useState<ThemeId>("cosmic");
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load saved theme from IndexedDB on mount
   */
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { memory } = await import("@/lib/memory"); // ✅ fixed
        const saved = await memory.getProfile("theme");
        if (saved && isValidTheme(saved)) {
          setThemeState(saved as ThemeId);
          document.documentElement.setAttribute("data-theme", saved);
        }
      } catch {
        // Use default theme
        document.documentElement.setAttribute("data-theme", "cosmic");
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  /**
   * Set theme and persist to IndexedDB
   */
  const setTheme = useCallback(async (newTheme: ThemeId) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);

    try {
      const { memory } = await import("@/lib/memory"); // ✅ fixed
      await memory.setProfile("theme", newTheme);
    } catch {
      // Silently fail if memory is unavailable
    }
  }, []);

  return [theme, setTheme, isLoading];
}

/**
 * Validate if a string is a valid theme ID
 */
function isValidTheme(theme: string): boolean {
  const validThemes: ThemeId[] = [
    "cosmic",
    "aurora",
    "nebula",
    "solar",
    "lunar",
    "oceanic",
    "rose",
    "forest",
    "golden",
  ];
  return validThemes.includes(theme as ThemeId);
}
