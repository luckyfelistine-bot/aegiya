// src/app/page.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import CosmosBackground from "@/components/CosmosBackground";
import Dashboard from "@/components/Dashboard";
import ThemePicker from "@/components/ThemePicker";
import Toast from "@/components/Toast";
import {
  HeartIcon,
  GlobeIcon,
  CodeIcon,
  ChatIcon,
} from "@/components/SvgIcons";

const Universe3D = dynamic(() => import("@/components/Universe3D"), { ssr: false });
const WorkspaceView = dynamic(() => import("@/components/WorkspaceView"), { ssr: false });
const ChatWindow = dynamic(() => import("@/components/ChatWindow"), { ssr: false });

type ViewMode = "universe" | "workspace" | "chat";

interface ToastState {
  show: boolean;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
}

export default function HomePage() {
  const [currentView, setCurrentView] = useState<ViewMode>("universe");
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [theme, setTheme] = useState("cosmic");
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "info",
    title: "",
    message: "",
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("byeol-theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "cosmic");
    }
  }, []);

  const showToast = useCallback(
    (type: ToastState["type"], title: string, message: string) => {
      setToast({ show: true, type, title, message });
    },
    []
  );
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), []);
  const navigateTo = useCallback((view: string) => {
    if (["universe", "workspace", "chat"].includes(view)) {
      setCurrentView(view as ViewMode);
      setIsDockOpen(false);
    }
  }, []);
  const toggleDashboard = useCallback(() => setIsDashboardOpen((p) => !p), []);
  const toggleDock = useCallback(() => setIsDockOpen((p) => !p), []);
  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("byeol-theme", newTheme);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-void">
      <CosmosBackground />

      <Dashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} onNavigate={navigateTo} />

      {/* Main Content – scrollable */}
        <div
          style={
            currentView === "universe"
              ? { width: "100%", height: "100%", overflow: "hidden", padding: 0, margin: 0 }
              : {}
          }
          className={
            currentView === "universe"
              ? ""
              : "h-full w-full overflow-y-auto p-4 md:p-6 scrollable-content"
          }
        >
          {currentView === "universe" && <Universe3D />}
          {currentView === "workspace" && <WorkspaceView showToast={showToast} onClose={() => setCurrentView("universe")} />}
          {currentView === "chat" && <ChatWindow onClose={() => setCurrentView("universe")} />}
        </div>

      {/* Dock – heart button + dropdown */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={toggleDock}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label="Open navigation"
        >
          <HeartIcon size={24} className="text-white" />
        </button>

        {isDockOpen && (
          <div
            className="absolute bottom-14 left-0 p-2 min-w-[180px] flex flex-col gap-2"
            style={{
              background: "rgba(10, 10, 26, 0.9)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
              animation: "fadeInUp 0.2s ease-out",
            }}
          >
            <button
              onClick={() => navigateTo("universe")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                currentView === "universe" ? "bg-purple-500/20 text-purple-400" : "hover:bg-white/10"
              }`}
            >
              <GlobeIcon size={18} />
              <span className="text-sm">Universe</span>
            </button>
            <button
              onClick={() => navigateTo("workspace")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                currentView === "workspace" ? "bg-purple-500/20 text-purple-400" : "hover:bg-white/10"
              }`}
            >
              <CodeIcon size={18} />
              <span className="text-sm">Workspace</span>
            </button>
            <button
              onClick={() => navigateTo("chat")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                currentView === "chat" ? "bg-purple-500/20 text-purple-400" : "hover:bg-white/10"
              }`}
            >
              <ChatIcon size={18} />
              <span className="text-sm">Chat</span>
            </button>
            <div className="border-t border-white/10 my-1" />
            <ThemePicker value={theme} onChange={handleThemeChange} />
          </div>
        )}
      </div>

      <Toast show={toast.show} type={toast.type} title={toast.title} message={toast.message} onClose={hideToast} />
    </main>
  );
}
