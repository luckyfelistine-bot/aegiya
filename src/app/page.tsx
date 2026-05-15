"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import CosmosBackground from "@/components/CosmosBackground";
import Dashboard from "@/components/Dashboard";
import { useToast } from "@/components/Toast";
import ToastContainer from "@/components/Toast";
import { memory } from "@/lib/memory";
import {
  HomeIcon,
  CodeIcon,
  ChatIcon,
  ConstellationIcon,
  GlobeIcon,
  HeartIcon,
  XIcon,
  MenuIcon,
} from "@/components/SvgIcons";
import ThemePicker from "@/components/ThemePicker";
import InstallButton from "@/components/InstallButton";

// Dynamic imports with loading states
const ChatWindow = dynamic(() => import("@/components/ChatWindow"), {
  ssr: false,
  loading: () => (
    <div className="view-loading">
      <div className="loading-spinner" />
      <p>Loading Chat...</p>
    </div>
  ),
});

const WorkspaceView = dynamic(() => import("@/components/WorkspaceView"), {
  ssr: false,
  loading: () => (
    <div className="view-loading">
      <div className="loading-spinner" />
      <p>Loading Workspace...</p>
    </div>
  ),
});

const Universe3D = dynamic(() => import("@/components/Universe3D"), {
  ssr: false,
  loading: () => (
    <div className="view-loading">
      <div className="loading-spinner" />
      <p>Loading Universe...</p>
    </div>
  ),
});

const ConstellationMap = dynamic(() => import("@/components/ConstellationMap"), {
  ssr: false,
  loading: () => (
    <div className="view-loading">
      <div className="loading-spinner" />
      <p>Loading Constellation...</p>
    </div>
  ),
});

type View = "dashboard" | "chat" | "workspace" | "universe" | "constellation";

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [heartOpen, setHeartOpen] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    memory.getProfile("onboarded").then((val) => {
      if (!val) setShowOnboarding(true);
    });
  }, []);

  const handleOnboard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    await memory.setProfile("userName", data.get("name") || "Dal");
    await memory.setProfile("favoriteColors", data.get("colors") || "pink, purple");
    await memory.setProfile("studyTopic", data.get("topic") || "medicine");
    await memory.setProfile("onboarded", "true");
    setShowOnboarding(false);
    showToast("Welcome aboard, Dal! ✨", "success");
  };

  const navigate = useCallback((view: View) => {
    setCurrentView(view);
    setSidebarOpen(false);
    setHeartOpen(false);
  }, []);

  const views: Record<View, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={navigate} onOpenLesson={() => showToast("Lesson feature coming soon!", "info")} />,
    chat: <ChatWindow onClose={() => navigate("universe")} />,
    workspace: <WorkspaceView showToast={showToast} onClose={() => navigate("universe")} />,
    universe: <Universe3D />,
    constellation: <ConstellationMap />,
  };

  return (
    <div className="app-shell">
      <CosmosBackground />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Onboarding modal */}
      {showOnboarding && (
        <div className="modal-overlay" onClick={() => setShowOnboarding(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "var(--radius-full)",
                  background: "linear-gradient(135deg, var(--accent), var(--aurora), var(--rose))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: "1.8rem",
                  boxShadow: "0 0 30px var(--accent-glow)",
                }}
              >
                ✨
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 10 }} className="text-gradient">
                Welcome, Dal
              </h2>
              <p style={{ fontSize: "0.88rem", color: "var(--lunar)", lineHeight: 1.6 }}>
                Byeol has been waiting for you. Let&apos;s personalize your star a little before we begin.
              </p>
            </div>
            <form onSubmit={handleOnboard}>
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input id="name" name="name" type="text" defaultValue="Dal" required />
              </div>
              <div className="form-group">
                <label htmlFor="colors">Favorite Colors</label>
                <input id="colors" name="colors" type="text" defaultValue="pink, purple" />
              </div>
              <div className="form-group">
                <label htmlFor="topic">What are you studying?</label>
                <input id="topic" name="topic" type="text" defaultValue="medicine" />
              </div>
              <button type="submit" className="neon-button">
                Start Your Journey
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="dashboard-sidebar-header">
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "var(--lunar)", cursor: "pointer" }}>
            <XIcon size={20} />
          </button>
        </div>
        <div className="dashboard-sidebar-content">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { id: "dashboard" as View, icon: <HomeIcon size={20} />, label: "Dashboard" },
              { id: "chat" as View, icon: <ChatIcon size={20} />, label: "Chat" },
              { id: "workspace" as View, icon: <CodeIcon size={20} />, label: "Workspace" },
              { id: "universe" as View, icon: <GlobeIcon size={20} />, label: "Universe" },
              { id: "constellation" as View, icon: <ConstellationIcon size={20} />, label: "Constellation" },
            ].map((item) => (
              <button
                key={item.id}
                className={`glass-button ${currentView === item.id ? "active" : ""}`}
                onClick={() => navigate(item.id)}
                style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
              >
                {item.icon}
                <span style={{ fontWeight: 500 }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dock */}
      <nav className="dock">
        <button className="dock-logo" onClick={() => setHeartOpen(!heartOpen)} aria-label="Menu">
          <HeartIcon size={20} />
        </button>
        <div className="dock-divider" />
        <button
          className={`dock-btn ${currentView === "dashboard" ? "active" : ""}`}
          onClick={() => navigate("dashboard")}
          aria-label="Dashboard"
        >
          <HomeIcon size={20} />
        </button>
        <button
          className={`dock-btn ${currentView === "chat" ? "active" : ""}`}
          onClick={() => navigate("chat")}
          aria-label="Chat"
        >
          <ChatIcon size={20} />
        </button>
        <button
          className={`dock-btn ${currentView === "workspace" ? "active" : ""}`}
          onClick={() => navigate("workspace")}
          aria-label="Workspace"
        >
          <CodeIcon size={20} />
        </button>
        <button
          className={`dock-btn ${currentView === "universe" ? "active" : ""}`}
          onClick={() => navigate("universe")}
          aria-label="Universe"
        >
          <GlobeIcon size={20} />
        </button>
        <button
          className={`dock-btn ${currentView === "constellation" ? "active" : ""}`}
          onClick={() => navigate("constellation")}
          aria-label="Constellation"
        >
          <ConstellationIcon size={20} />
        </button>
        <div className="dock-divider" />
        <button
          className="dock-btn hide-mobile"
          onClick={() => setSidebarOpen(true)}
          aria-label="Menu"
        >
          <MenuIcon size={20} />
        </button>

        {/* Heart dropdown */}
        {heartOpen && (
          <div className="dock-dropdown">
            <div style={{ padding: "8px 4px 10px", borderBottom: "1px solid var(--glass-border)", marginBottom: 10 }}>
              <p style={{ fontSize: "0.75rem", color: "var(--lunar)", textAlign: "center" }}>
                Made with love for Dal
              </p>
            </div>
            <ThemePicker />
            <div style={{ padding: "10px 4px 4px", borderTop: "1px solid var(--glass-border)", marginTop: 10 }}>
              <InstallButton />
            </div>
          </div>
        )}
      </nav>

      {/* Main content — ALWAYS scrollable, NEVER split with universe */}
      <main className="main-content">
        <Suspense
          fallback={
            <div className="view-loading">
              <div className="loading-spinner" />
              <p>Loading view...</p>
            </div>
          }
        >
          {views[currentView]}
        </Suspense>
      </main>
    </div>
  );
}
