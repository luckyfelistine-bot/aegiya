"use client";

import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { memory } from "@/lib/memory";
import { ChatWindow } from "@/components/ChatWindow";
import Dashboard from "@/components/Dashboard";
import Toast from "@/components/Toast";
import ThemePicker from "@/components/ThemePicker";
import CosmosBackground from "@/components/CosmosBackground";
import {
  HomeIcon,
  CodeIcon,
  SparklesIcon,
  MessageCircleIcon,
  XIcon,
  HeartIcon,
  PlaneIcon,
  BuildingIcon,
  CarIcon,
  BabyIcon,
  MapPinIcon,
  StarIcon,
} from "@/components/SvgIcons";

import dynamic from "next/dynamic";

const UniverseView = dynamic(() => import("@/components/UniverseView"), { ssr: false });
const WorkspaceView = dynamic(() => import("@/components/WorkspaceView"), { ssr: false });

type ViewType = "universe" | "workspace" | "chat";
type UniverseScene = "home" | "city" | "vacation" | "family" | "future";

interface ToastState {
  show: boolean;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("universe");
  const [universeScene, setUniverseScene] = useState<UniverseScene>("home");
  const [chatOpen, setChatOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false); // Collapsible dashboard
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [theme, setTheme] = useState("andromeda");
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "info",
    title: "",
    message: "",
  });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1100);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load saved state
  useEffect(() => {
    const init = async () => {
      try {
        const hasVisited = await memory.getProfile("hasVisited");
        if (!hasVisited) setShowOnboarding(true);

        const savedTheme = await memory.getProfile("theme");
        if (savedTheme) {
          setTheme(savedTheme);
          document.documentElement.setAttribute("data-theme", savedTheme);
        }

        const savedScene = await memory.getProfile("universeScene");
        if (savedScene) setUniverseScene(savedScene as UniverseScene);
      } catch (e) {
        console.error("Init error:", e);
      }
    };
    init();
  }, []);

  const showToast = useCallback(
    (type: ToastState["type"], title: string, message: string) => {
      setToast({ show: true, type, title, message });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 5000);
    },
    []
  );

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    await memory.setProfile("theme", newTheme);
    showToast("info", "Theme Changed", `Constellation set to ${newTheme}`);
  };

  const handleSceneChange = async (scene: UniverseScene) => {
    setUniverseScene(scene);
    await memory.setProfile("universeScene", scene);
    const sceneNames: Record<UniverseScene, string> = {
      home: "Our Home",
      city: "Our City",
      vacation: "Vacation Mode",
      family: "Our Family",
      future: "Our Future",
    };
    showToast("success", "Universe Updated", `Now viewing: ${sceneNames[scene]}`);
  };

  const handleOnboardingComplete = async (data: {
    name: string;
    colors: string;
    study: string;
  }) => {
    try {
      await memory.setProfile("hasVisited", true);
      await memory.setProfile("name", data.name);
      await memory.setProfile("colors", data.colors);
      await memory.setProfile("study", data.study);
      await memory.setProfile("joined", Date.now());
      setShowOnboarding(false);
      showToast("success", "Welcome!", `Byeol is ready for you, ${data.name}!`);
    } catch (e) {
      console.error("Onboarding error:", e);
      setShowOnboarding(false);
    }
  };

  const handleToolCall = useCallback(
    async (tool: string, params: any) => {
      switch (tool) {
        case "openWorkspace":
          setCurrentView("workspace");
          showToast("info", "Workspace Opened", "Byeol opened the editor for you");
          return { success: true };
        case "setCode":
          window.dispatchEvent(new CustomEvent("byeol:setCode", { detail: { code: params.code } }));
          setCurrentView("workspace");
          return { success: true };
        case "createProject":
          await memory.saveProject(params.name, params.code || "", params.language || "html");
          showToast("success", "Project Created", `${params.name} saved`);
          return { success: true };
        case "readEditor":
          return new Promise((resolve) => {
            window.dispatchEvent(
              new CustomEvent("byeol:getCode", {
                detail: { callback: (code: string) => resolve({ code }) },
              })
            );
          });
        default:
          return { error: "Unknown tool" };
      }
    },
    [showToast]
  );

  const toggleDashboard = () => setIsDashboardOpen(!isDashboardOpen);

  return (
    <div className="app-shell">
      <CosmosBackground />

      <ThemePicker value={theme} onChange={handleThemeChange} />
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, show: false }))} />

      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      {isMobile && chatOpen && <div className="chat-overlay open" onClick={() => setChatOpen(false)} />}

      {/* Collapsible Dashboard Sidebar */}
      <aside className={`dashboard-sidebar ${isDashboardOpen ? "open" : ""}`}>
        <div className="dashboard-sidebar-header">
          <button className="close-dashboard" onClick={toggleDashboard} aria-label="Close dashboard">
            <XIcon />
          </button>
        </div>
        <div className="dashboard-sidebar-content">
          <Dashboard
            onNavigate={(view) => {
              if (view === "workspace") setCurrentView("workspace");
              else if (view === "constellation") setCurrentView("universe");
              // Close dashboard after navigation (optional)
              setIsDashboardOpen(false);
            }}
            onOpenLesson={() => {
              setCurrentView("workspace");
              setIsDashboardOpen(false);
            }}
          />
        </div>
      </aside>

      {/* LEFT: Dock */}
      <nav className="dock glass" role="navigation">
        <button className="dock-logo" onClick={toggleDashboard} title="Dashboard (Love Emoji)">
          <HeartIcon />
        </button>
        <div className="dock-divider" />

        <DockButton
          active={currentView === "universe"}
          onClick={() => setCurrentView("universe")}
          title="Universe"
          icon={<StarIcon />}
        />
        <DockButton
          active={currentView === "workspace"}
          onClick={() => setCurrentView("workspace")}
          title="Code"
          icon={<CodeIcon />}
        />
        <DockButton
          active={currentView === "chat" || chatOpen}
          onClick={() => (isMobile ? setChatOpen(true) : setCurrentView("chat"))}
          title="Chat"
          icon={<MessageCircleIcon />}
        />

        <div className="dock-divider" />

        <DockButton
          active={universeScene === "home"}
          onClick={() => handleSceneChange("home")}
          title="Our Home"
          icon={<HomeIcon />}
        />
        <DockButton
          active={universeScene === "city"}
          onClick={() => handleSceneChange("city")}
          title="Our City"
          icon={<BuildingIcon />}
        />
        <DockButton
          active={universeScene === "vacation"}
          onClick={() => handleSceneChange("vacation")}
          title="Vacation"
          icon={<PlaneIcon />}
        />
        <DockButton
          active={universeScene === "family"}
          onClick={() => handleSceneChange("family")}
          title="Family"
          icon={<BabyIcon />}
        />
        <DockButton
          active={universeScene === "future"}
          onClick={() => handleSceneChange("future")}
          title="Future"
          icon={<MapPinIcon />}
        />
      </nav>

      {/* CENTER: Main Content */}
      <main className="main-content">
        {currentView === "universe" && (
          <Suspense fallback={<div className="view-loading"><div className="loading-spinner" /><p>Loading universe...</p></div>}>
            <UniverseView
              scene={universeScene}
              onSceneChange={handleSceneChange}
              onOpenChat={() => (isMobile ? setChatOpen(true) : setCurrentView("chat"))}
              onOpenWorkspace={() => setCurrentView("workspace")}
            />
          </Suspense>
        )}

        {currentView === "workspace" && (
          <Suspense fallback={<div className="view-loading"><div className="loading-spinner" /><p>Loading workspace...</p></div>}>
            <WorkspaceView
              showToast={showToast}
              onClose={() => setCurrentView("universe")}
            />
          </Suspense>
        )}

        {currentView === "chat" && !isMobile && (
          <div className="chat-fullscreen">
            <ChatWindow onClose={() => setCurrentView("universe")} onToolCall={handleToolCall} />
          </div>
        )}
      </main>

      {/* RIGHT: Chat Panel (Desktop) */}
      {!isMobile && (
        <aside className={`chat-panel glass ${chatOpen ? "open" : ""}`}>
          <ChatWindow onClose={() => setChatOpen(false)} onToolCall={handleToolCall} />
        </aside>
      )}

      {/* Mobile Chat Drawer */}
      {isMobile && (
        <div className={`chat-drawer ${chatOpen ? "open" : ""}`}>
          <div className="chat-drawer-header"><h3>Byeol</h3><button className="icon-btn" onClick={() => setChatOpen(false)}><XIcon /></button></div>
          <ChatWindow onClose={() => setChatOpen(false)} onToolCall={handleToolCall} />
        </div>
      )}

      {/* Floating Chat Button */}
      {!chatOpen && currentView !== "chat" && (
        <button className="fab-chat" onClick={() => (isMobile ? setChatOpen(true) : setChatOpen(true))}>
          <MessageCircleIcon />
        </button>
      )}
    </div>
  );
}

function DockButton({ active, onClick, title, icon }: { active: boolean; onClick: () => void; title: string; icon: React.ReactNode }) {
  return (
    <button className={`dock-btn ${active ? "active" : ""}`} onClick={onClick} title={title}>
      {icon}
    </button>
  );
}

function OnboardingModal({ onComplete }: { onComplete: (data: { name: string; colors: string; study: string }) => void }) {
  const [name, setName] = useState("Dal");
  const [colors, setColors] = useState("pink, purple");
  const [study, setStudy] = useState("Clinical Medicine");

  return (
    <div className="modal-overlay open">
      <div className="modal-content glass-lg">
        <div className="modal-icon"><SparklesIcon /></div>
        <h2>Welcome, Dal</h2>
        <p>Byeol has been waiting for you. Let&apos;s personalize your universe before we begin.</p>
        <div className="form-group"><label>Your Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="form-group"><label>Favorite Colors</label><input value={colors} onChange={(e) => setColors(e.target.value)} /></div>
        <div className="form-group"><label>What are you studying?</label><input value={study} onChange={(e) => setStudy(e.target.value)} /></div>
        <button className="neon-btn" onClick={() => onComplete({ name, colors, study })}>Enter Our Universe</button>
      </div>
    </div>
  );
}
