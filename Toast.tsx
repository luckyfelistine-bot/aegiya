// src/components/InstallButton.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DownloadIcon, CheckIcon } from "./SvgIcons";

/**
 * BeforeInstallPromptEvent - Custom event for PWA installation
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * InstallButton - PWA install prompt button
 * Shows when the app can be installed as a standalone PWA
 */
export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Listen for the beforeinstallprompt event
   */
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  /**
   * Trigger the install prompt
   */
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  }, [deferredPrompt]);

  if (!isVisible || isInstalled) return null;

  return (
    <button
      onClick={handleInstall}
      className="glass-button px-4 py-2 text-sm font-medium animate-fade-in hover:bg-success/20 hover:border-success/50"
    >
      <DownloadIcon size={16} />
      <span>Install Byeol</span>
    </button>
  );
}
