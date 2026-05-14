// src/hooks/useMediaQuery.ts
"use client";

import { useState, useEffect } from "react";

/**
 * useMediaQuery - React hook for responsive design
 * Returns true when the media query matches
 * @param query - CSS media query string (e.g., "(max-width: 768px)")
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    /**
     * Handle media query change events
     */
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (modern API with fallback)
    if (media.addEventListener) {
      media.addEventListener("change", handler);
    } else {
      // Fallback for older browsers
      media.addListener(handler);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handler);
      } else {
        media.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Predefined media query hooks for common breakpoints
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1025px)");
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}
