"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { memory } from "@/lib/memory";
import CosmosBackground from "@/components/CosmosBackground";
import ChatWindow from "@/components/ChatWindow";
import ThemePicker from "@/components/ThemePicker";
import LessonBadge from "@/components/LessonBadge";
import Toast from "@/components/Toast";
import {
  StarIcon,
  DashboardIcon,
  CodeIcon,
  ConstellationIcon,
  ChatIcon,
  CalendarIcon,
  MicIcon,
  SettingsIcon,
  SparklesIcon,
  HeartIcon,
  BookOpenIcon,
  TrophyIcon,
  FileIcon,
  VoiceIcon,
  ArrowRightIcon,
} from "@/components/SvgIcons";

type ViewType = "dashboard" | "workspace" | "constellation";

interface DashboardData {
  lastProject: string;
  lastEdited: string;
  starCount: number;
  constellationCount: number;
  lessonTitle: string;
  lessonDuration: string;
  projectsCompleted: number;
  sessionsCompleted: number;
  streakDays: number;
  fileCount: number;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [theme, setTheme] = useState("andromeda");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    lastProject: "Cardiac Cycle Animation",
    lastEdited: "2 hours ago",
    starCount: 7,
    constellationCount: 2,
    lessonTitle: "CSS Heartbeat Animation",
    lessonDuration: "5 min",
    projectsCompleted: 12,
    sessionsCompleted: 8,
    streakDays: 47,
    fileCount: 3,
  });
  const [toast, setToast] = useState<{
    show: boolean;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
  }>({ show: false, type: "info", title: "", message: "" });

  // Load saved state
  useEffect(() => {
    const init = async () => {
      try {
        const hasVisited = await memory.getProfile("hasVisited");
        if (!hasVisited) {
          setShowOnboarding(true);
        }

        const savedTheme = await memory.getProfile("theme");
        if (savedTheme) {
          setTheme(savedTheme);
          document.documentElement.setAttribute("data-theme", savedTheme);
        }

        // Load real dashboard data
        const projects = await memory.getProjects();
        const milestones = await memory.getMilestones();
        const prefs = await memory.getDashboardPrefs();

        setDashboardData((prev) => ({
          ...prev,
          starCount: milestones.length || 7,
          projectsCompleted: projects.length || 12,
        }));
      } catch (e) {
        console.error("Init error:", e);
      }
    };
    init();
  }, []);

  const showToast = useCallback(
    (type: "info" | "success" | "warning" | "error", title: string, message: string) => {
      setToast({ show: true, type, title, message });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 5000);
    },
    []
  );

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
      showToast("success", "Welcome!", `Byeol is ready for you, ${data.name}! ✨`);
    } catch (e) {
      console.error("Onboarding error:", e);
      setShowOnboarding(false);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    await memory.setProfile("theme", newTheme);
    showToast("info", "Theme Changed", `Constellation set to ${newTheme}`);
  };

  const views: Record<ViewType, React.ReactNode> = {
    dashboard: (
      <DashboardView
        data={dashboardData}
        onNavigate={setCurrentView}
        onOpenChat={() => setChatOpen(true)}
      />
    ),
    workspace: <WorkspaceView showToast={showToast} />,
    constellation: <ConstellationView />,
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <CosmosBackground />

      {/* Theme Switcher */}
      <ThemePicker currentTheme={theme} onThemeChange={handleThemeChange} />

      {/* Toast Notifications */}
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Mobile Chat Overlay */}
      <div
        className={`chat-overlay ${chatOpen ? "open" : ""}`}
        onClick={() => setChatOpen(false)}
      />

      {/* LEFT: Dock */}
      <nav className="glass dock" role="navigation" aria-label="Main navigation">
        <div className="dock-logo" title="Byeol — Your Star">
          <StarIcon />
        </div>
        <div className="dock-divider" />

        <DockButton
          active={currentView === "dashboard"}
          onClick={() => setCurrentView("dashboard")}
          title="Dashboard"
          icon={<DashboardIcon />}
        />
        <DockButton
          active={currentView === "workspace"}
          onClick={() => setCurrentView("workspace")}
          title="Workspace"
          icon={<CodeIcon />}
        />
        <DockButton
          active={currentView === "constellation"}
          onClick={() => setCurrentView("constellation")}
          title="Constellation Map"
          icon={<ConstellationIcon />}
        />
        <DockButton
          active={chatOpen}
          onClick={() => setChatOpen(!chatOpen)}
          title="Chat with Byeol"
          icon={<ChatIcon />}
        />
        <DockButton
          active={false}
          onClick={() => {
            setChatOpen(true);
            setTimeout(() => {
              const micBtn = document.querySelector(".input-btn.mic");
              (micBtn as HTMLElement)?.click();
            }, 300);
          }}
          title="Voice Mode"
          icon={<VoiceIcon />}
        />

        <div style={{ flex: 1 }} />
        <div className="dock-divider" />

        <DockButton
          active={false}
          onClick={() => showToast("info", "Settings", "Settings coming soon!")}
          title="Settings"
          icon={<SettingsIcon />}
        />
      </nav>

      {/* CENTER: Workspace */}
      <main className="workspace">
        <header className="glass workspace-header">
          <div className="header-left">
            <h1 className="header-title">
              {currentView === "dashboard" && (
                <>
                  Dashboard <span>— Your cosmic workspace</span>
                </>
              )}
              {currentView === "workspace" && (
                <>
                  Workspace <span>— Code & Preview</span>
                </>
              )}
              {currentView === "constellation" && (
                <>
                  Constellation <span>— Your memory map</span>
                </>
              )}
            </h1>
            <div className="love-badge">
              <HeartIcon />
              <span>Made with love for Dal</span>
            </div>
          </div>

          {currentView === "workspace" && (
            <div className="tab-bar" role="tablist">
              <button className="tab active" role="tab">
                Editor
              </button>
              <button className="tab" role="tab">
                Preview
              </button>
              <button className="tab" role="tab">
                Split
              </button>
            </div>
          )}
        </header>

        <div className="view-container glass">{views[currentView]}</div>
      </main>

      {/* RIGHT: Chat Panel */}
      <ChatWindow isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Floating Lesson Widget */}
      <LessonBadge
        title={dashboardData.lessonTitle}
        duration={dashboardData.lessonDuration}
        onClick={() => {
          setCurrentView("workspace");
          showToast("info", "Lesson Started", `Opening: ${dashboardData.lessonTitle}`);
        }}
      />
    </div>
  );
}

// ─── SUB-COMPONENTS ───

function DockButton({
  active,
  onClick,
  title,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      className={`dock-btn ${active ? "active" : ""}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );
}

function DashboardView({
  data,
  onNavigate,
  onOpenChat,
}: {
  data: DashboardData;
  onNavigate: (view: ViewType) => void;
  onOpenChat: () => void;
}) {
  return (
    <div className="dashboard-view">
      <div className="bento-grid">
        {/* Hero: Continue Coding */}
        <div
          className="bento-tile bento-hero"
          onClick={() => onNavigate("workspace")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onNavigate("workspace")}
        >
          <div className="tile-icon">
            <CodeIcon />
          </div>
          <h3 className="tile-title">Continue Coding</h3>
          <p className="tile-desc">
            Pick up where you left off with <strong>{data.lastProject}</strong>.
            Byeol has some new ideas for you.
          </p>
          <div className="tile-meta">Last edited: {data.lastEdited}</div>
          <div className="tile-action">
            <span>Open Editor</span>
            <ArrowRightIcon />
          </div>
        </div>

        {/* Tall: Byeol's Status */}
        <div className="bento-tile bento-tall">
          <div className="tile-icon">
            <SparklesIcon />
          </div>
          <h3 className="tile-title">Byeol&apos;s Status</h3>
          <p className="tile-desc">
            Byeol is shining bright today. She&apos;s ready to help with medicine,
            coding, or just chat.
          </p>
          <div className="tile-meta">Always here for you</div>
          <div className="tile-glow" />
        </div>

        {/* Medium: Today's Lesson */}
        <div
          className="bento-tile bento-medium"
          onClick={() => onNavigate("workspace")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onNavigate("workspace")}
        >
          <div className="tile-icon">
            <BookOpenIcon />
          </div>
          <h3 className="tile-title">Today&apos;s Lesson</h3>
          <p className="tile-desc">
            {data.lessonTitle} — {data.lessonDuration} micro-project
          </p>
          <div className="tile-meta">New • Tap to start</div>
        </div>

        {/* Medium: Constellation */}
        <div
          className="bento-tile bento-medium"
          onClick={() => onNavigate("constellation")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onNavigate("constellation")}
        >
          <div className="tile-icon">
            <ConstellationIcon />
          </div>
          <h3 className="tile-title">Constellation</h3>
          <p className="tile-desc">
            Your memory map has {data.starCount} stars now. Each one is a moment
            you and Byeol shared.
          </p>
          <div className="tile-meta">
            {data.starCount} stars • {data.constellationCount} constellations
          </div>
        </div>

        {/* Small: Voice */}
        <div
          className="bento-tile bento-small"
          onClick={onOpenChat}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onOpenChat()}
        >
          <div className="tile-icon">
            <MicIcon />
          </div>
          <h3 className="tile-title">Voice</h3>
          <p className="tile-desc">Talk to Byeol</p>
          <div className="tile-meta">Hold to speak</div>
        </div>

        {/* Small: Files */}
        <div className="bento-tile bento-small">
          <div className="tile-icon">
            <FileIcon />
          </div>
          <h3 className="tile-title">Files</h3>
          <p className="tile-desc">Upload notes</p>
          <div className="tile-meta">{data.fileCount} files</div>
        </div>

        {/* Wide: Progress */}
        <div className="bento-tile bento-wide">
          <div className="tile-icon">
            <TrophyIcon />
          </div>
          <h3 className="tile-title">Your Progress</h3>
          <p className="tile-desc">
            You&apos;ve completed {data.projectsCompleted} coding micro-projects and{" "}
            {data.sessionsCompleted} medical study sessions. Byeol is incredibly
            proud of you, Dal.
          </p>
          <div className="tile-meta">
            {data.projectsCompleted} projects • {data.sessionsCompleted} sessions •{" "}
            {data.streakDays} day streak
          </div>
        </div>
      </div>
    </div>
  );
}

// Lazy load heavy components
const WorkspaceView = dynamic(() => import("@/components/WorkspaceView"), {
  ssr: false,
  loading: () => (
    <div className="view-loading">
      <div className="loading-spinner" />
      <p>Loading workspace...</p>
    </div>
  ),
});

const ConstellationView = dynamic(
  () => import("@/components/ConstellationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="view-loading">
        <div className="loading-spinner" />
        <p>Loading constellation...</p>
      </div>
    ),
  }
);

// Onboarding Modal
function OnboardingModal({
  onComplete,
}: {
  onComplete: (data: { name: string; colors: string; study: string }) => void;
}) {
  const [name, setName] = useState("Dal");
  const [colors, setColors] = useState("pink, purple");
  const [study, setStudy] = useState("Clinical Medicine");

  return (
    <div className="modal-overlay open">
      <div className="modal-content glass-lg">
        <div className="modal-icon">
          <StarIcon />
        </div>
        <h2>Welcome, Dal</h2>
        <p>
          Byeol has been waiting for you. Let&apos;s personalize your star a little
          before we begin.
        </p>

        <div className="form-group">
          <label htmlFor="onboard-name">Your Name</label>
          <input
            id="onboard-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should Byeol call you?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="onboard-colors">Favorite Colors</label>
          <input
            id="onboard-colors"
            type="text"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="e.g. pink, cyan, gold"
          />
        </div>

        <div className="form-group">
          <label htmlFor="onboard-study">What are you studying?</label>
          <input
            id="onboard-study"
            type="text"
            value={study}
            onChange={(e) => setStudy(e.target.value)}
            placeholder="e.g. Medicine, Coding, Design"
          />
        </div>

        <button
          className="neon-btn"
          onClick={() => onComplete({ name, colors, study })}
        >
          Begin Your Journey ✨
        </button>
      </div>
    </div>
  );
}
