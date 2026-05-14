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
  SparklesIcon,
} from "@/components/SvgIcons";

/**
 * Dynamic imports for heavy components to improve initial load
 */
const Universe3D = dynamic(() => import("@/components/Universe3D"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-starlight/50 animate-pulse">Loading Universe...</div>
    </div>
  ),
});

const ChatWindow = dynamic(() => import("@/components/ChatWindow"), { ssr: false });

const ChatWindow = dynamic(
  () => import("@/components/ChatWindow").then((mod) => mod.default),
  { ssr: false }
);

/**
 * Available application views
 */
type ViewMode = "universe" | "workspace" | "chat";

/**
 * Toast notification state
 */
interface ToastState {
  show: boolean;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
}

/**
 * Dock item configuration
 */
interface DockItem {
  id: ViewMode;
  icon: React.ReactNode;
  label: string;
  color: string;
}

/**
 * Main page component - Orchestrates the entire application
 * Manages view switching, dashboard sidebar, dock, and global UI elements
 */
export default function HomePage() {
  const [currentView, setCurrentView] = useState<ViewMode>("universe");
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "info",
    title: "",
    message: "",
  });
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Dock items configuration
   */
  const dockItems: DockItem[] = [
    {
      id: "universe",
      icon: <GlobeIcon size={22} />,
      label: "Universe",
      color: "#06b6d4",
    },
    {
      id: "workspace",
      icon: <CodeIcon size={22} />,
      label: "Workspace",
      color: "#8b5cf6",
    },
    {
      id: "chat",
      icon: <ChatIcon size={22} />,
      label: "Chat",
      color: "#ec4899",
    },
  ];

  /**
   * Detect mobile viewport
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * Show a toast notification
   */
  const showToast = useCallback(
    (type: ToastState["type"], title: string, message: string) => {
      setToast({ show: true, type, title, message });
    },
    []
  );

  /**
   * Hide the toast notification
   */
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  /**
   * Navigate to a specific view
   */
  const navigateTo = useCallback(
    (view: string) => {
      if (["universe", "workspace", "chat"].includes(view)) {
        setCurrentView(view as ViewMode);
        setIsDashboardOpen(false);
      }
    },
    []
  );

  /**
   * Toggle dashboard sidebar
   */
  const toggleDashboard = useCallback(() => {
    setIsDashboardOpen((prev) => !prev);
  }, []);

  /**
   * Welcome toast on first visit
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      showToast("info", "Welcome to Byeol", "Your personal universe awaits, Dal.");
    }, 1500);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-void">
      {/* Cosmic Background */}
      <CosmosBackground />

      {/* Dashboard Sidebar */}
      <Dashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onNavigate={navigateTo}
      />

      {/* Main Content Area */}
      <div
        className={`relative h-full transition-all duration-300 ${
          isDashboardOpen && !isMobile ? "ml-80" : "ml-0"
        }`}
      >
        {/* View Container */}
        <div className="h-full pb-20 md:pb-0 md:pl-20">
          {currentView === "universe" && <Universe3D />}
          {currentView === "workspace" && <WorkspaceView />}
          {currentView === "chat" && <ChatWindow />}
        </div>
      </div>

      {/* Dock - Desktop (left side) / Mobile (bottom) */}
      <nav
        className={`fixed z-50 flex items-center gap-2 ${
          isMobile
            ? "bottom-4 left-1/2 -translate-x-1/2 flex-row"
            : "left-4 top-1/2 -translate-y-1/2 flex-col"
        }`}
      >
        <div className="glass-panel p-2 flex flex-col gap-2">
          {/* Dashboard Toggle */}
          <button
            onClick={toggleDashboard}
            className={`relative group p-3 rounded-xl transition-all duration-300 ${
              isDashboardOpen
                ? "bg-aurora/20 text-aurora shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                : "text-starlight/60 hover:text-starlight hover:bg-white/10"
            }`}
            aria-label="Toggle dashboard"
          >
            <HeartIcon size={22} />
            {isDashboardOpen && (
              <span className="absolute inset-0 rounded-xl animate-pulse bg-aurora/10" />
            )}
          </button>

          <div className="w-8 h-px bg-glass-border mx-auto" />

          {/* View Switchers */}
          {dockItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`relative group p-3 rounded-xl transition-all duration-300 ${
                currentView === item.id
                  ? "text-starlight shadow-[0_0_16px_rgba(0,0,0,0.3)]"
                  : "text-starlight/50 hover:text-starlight hover:bg-white/10"
              }`}
              style={
                currentView === item.id
                  ? {
                      backgroundColor: `${item.color}20`,
                      boxShadow: `0 0 20px ${item.color}30`,
                    }
                  : {}
              }
              aria-label={`Switch to ${item.label}`}
            >
              {item.icon}

              {/* Tooltip */}
              <span
                className={`absolute ${
                  isMobile ? "bottom-full left-1/2 -translate-x-1/2 mb-2" : "left-full ml-3 top-1/2 -translate-y-1/2"
                } px-2 py-1 rounded-md bg-eclipse text-xs text-starlight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50`}
              >
                {item.label}
              </span>
            </button>
          ))}

          <div className="w-8 h-px bg-glass-border mx-auto" />

          {/* Brand indicator */}
          <div className="p-3 flex items-center justify-center">
            <SparklesIcon size={18} className="text-aurora/50" />
          </div>
        </div>
      </nav>

      {/* Theme Picker */}
      <ThemePicker />

      {/* Toast Notifications */}
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />
    </main>
  );
}
