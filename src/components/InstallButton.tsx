"use client";

import React, { useState, useEffect } from "react";
import { DownloadIcon, CloseIcon } from "./SvgIcons";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowButton(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowButton(false);
    localStorage.setItem("byeol-install-dismissed", "true");
  };

  useEffect(() => {
    if (localStorage.getItem("byeol-install-dismissed") === "true") {
      setDismissed(true);
    }
  }, []);

  if (!showButton || dismissed) return null;

  return (
    <div
      className="glass-sm"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        animation: "slideUp 0.6s ease-out",
      }}
    >
      <DownloadIcon size={18} />
      <div>
        <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>Install Byeol</div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Add to your home screen</div>
      </div>
      <button className="neon-btn" onClick={handleInstall} style={{ padding: "8px 16px", fontSize: "0.8rem", width: "auto" }}>
        Install
      </button>
      <button className="icon-btn" onClick={handleDismiss} title="Dismiss">
        <CloseIcon size={14} />
      </button>
    </div>
  );
}
