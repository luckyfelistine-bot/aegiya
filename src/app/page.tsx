"use client";

import React, { useState, useCallback, useEffect } from "react";
import { memory } from "@/lib/memory";
import CosmosBackground from "@/components/CosmosBackground";
import Dashboard from "@/components/Dashboard";
import CodeEditor from "@/components/CodeEditor";
import PreviewFrame from "@/components/PreviewFrame";
import ChatWindow from "@/components/ChatWindow";
import ConstellationMap from "@/components/ConstellationMap";
import ThemePicker from "@/components/ThemePicker";
import LessonBadge from "@/components/LessonBadge";
import InstallButton from "@/components/InstallButton";
import FileUploader from "@/components/FileUploader";
import { ToastProvider, useToast } from "@/components/Toast";
import {
  StarIcon, DashboardIcon, CodeIcon, ConstellationIcon,
  ChatIcon, MicIcon, HeartIcon
} from "@/components/SvgIcons";

type ViewName = "dashboard" | "workspace" | "constellation";

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewName>("dashboard");
  const [code, setCode] = useState(`<!-- Byeol crafted this for Dal 💫 -->
<div class="heart-container">
  <h1>Cardiac Cycle Interactive</h1>
  <div id="heart">❤️</div>
  <button onclick="beat()">Make it beat</button>
</div>

<style>
  .heart-container {
    background: linear-gradient(135deg, #ff6b9d, #a855f7);
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    font-family: sans-serif;
    color: white;
  }
  #heart {
    font-size: 4rem;
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 12px;
    background: white;
    color: #a855f7;
    font-weight: bold;
    cursor: pointer;
  }
</style>

<script>
  function beat() {
    const heart = document.getElementById('heart');
    heart.style.animation = 'none';
    setTimeout(() => heart.style.animation = 'pulse 0.5s ease-in-out 3', 10);
  }
</script>`);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    memory.init().then(() => {
      memory.getProfile("lastCode").then((saved) => {
        if (saved) setCode(saved);
      });
      memory.getProfile("hasVisited").then((visited) => {
        if (!visited) setShowOnboarding(true);
      });
    });
  }, []);

  const handleCodeUpdate = useCallback((newCode: string) => {
    setCode(newCode);
    setPreviewHtml(newCode);
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleRun = useCallback(() => {
    setPreviewHtml(code);
  }, [code]);

  const handleLoadLesson = useCallback((lessonCode: string, title: string) => {
    setCode(lessonCode);
    setPreviewHtml(lessonCode);
    setCurrentView("workspace");
    showToast("Lesson Loaded", `${title} is ready in your editor! ✨`, "success");
  }, [showToast]);

  const handleFileUpload = useCallback((text: string, filename: string) => {
    showToast("File Uploaded", `Processing "${filename}"...`, "info");
  }, [showToast]);

  const handleOnboarding = async () => {
    const name = (document.getElementById("onboardName") as HTMLInputElement)?.value || "Dal";
    const colors = (document.getElementById("onboardColors") as HTMLInputElement)?.value || "pink, purple";
    const study = (document.getElementById("onboardStudy") as HTMLInputElement)?.value || "Clinical Medicine";
    await memory.setProfile("hasVisited", true);
    await memory.setProfile("name", name);
    await memory.setProfile("colors", colors);
    await memory.setProfile("study", study);
    await memory.setProfile("joined", Date.now());
    setShowOnboarding(false);
    showToast("Welcome!", `Hello ${name}, Byeol is ready for you ✨`, "success");
  };

  const views: Record<ViewName, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={(v) => setCurrentView(v as ViewName)} onOpenLesson={() => handleLoadLesson(`<!-- CSS Heartbeat Animation -->
<style>
  .heart { font-size: 5rem; animation: heartbeat 1.2s ease-in-out infinite; text-align: center; margin-top: 2rem; }
  @keyframes heartbeat { 0%,100%{transform:scale(1)} 25%{transform:scale(1.1)} 50%{transform:scale(1)} 75%{transform:scale(1.05)} }
  body { background: #1a1a2e; color: white; font-family: sans-serif; }
</style>
<div class="heart">❤️</div>
<p style="text-align:center;color:#ff6b9d;">Dal's Heartbeat</p>`, "CSS Heartbeat Animation")} />,
    workspace: (
      <div className="editor-preview-split">
        <CodeEditor code={code} onChange={handleCodeChange} onRun={handleRun} />
        <PreviewFrame html={previewHtml || code} onRefresh={handleRun} />
      </div>
    ),
    constellation: <ConstellationMap />,
  };

  const titles: Record<ViewName, string> = {
    dashboard: 'Dashboard <span>— Your cosmic workspace</span>',
    workspace: 'Workspace <span>— Code & Preview</span>',
    constellation: 'Constellation <span>— Your memory map</span>',
  };

  return (
    <>
      <CosmosBackground />
      <ThemePicker />

      {showOnboarding && (
        <div className="modal-overlay open">
          <div className="modal-content glass-lg">
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>
              <StarIcon size={48} />
            </div>
            <h2>Welcome, Dal</h2>
            <p>Byeol has been waiting for you. Let's personalize your star a little before we begin.</p>
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" id="onboardName" defaultValue="Dal" placeholder="What should Byeol call you?" />
            </div>
            <div className="form-group">
              <label>Favorite Colors</label>
              <input type="text" id="onboardColors" defaultValue="pink, purple" placeholder="e.g. pink, cyan, gold" />
            </div>
            <div className="form-group">
              <label>What are you studying?</label>
              <input type="text" id="onboardStudy" defaultValue="Clinical Medicine" placeholder="e.g. Medicine, Coding, Design" />
            </div>
            <button className="neon-btn" onClick={handleOnboarding}>Begin Your Journey ✨</button>
          </div>
        </div>
      )}

      <div className={`chat-overlay ${chatOpen ? "open" : ""}`} onClick={() => setChatOpen(false)} />

      <div className="app-shell">
        <div className="glass dock">
          <div className="dock-logo" title="Byeol — Your Star">
            <StarIcon size={24} />
          </div>
          <div className="dock-divider" />
          <button className={`dock-btn ${currentView === "dashboard" ? "active" : ""}`} title="Dashboard" onClick={() => setCurrentView("dashboard")}>
            <DashboardIcon size={22} />
          </button>
          <button className={`dock-btn ${currentView === "workspace" ? "active" : ""}`} title="Workspace" onClick={() => setCurrentView("workspace")}>
            <CodeIcon size={22} />
          </button>
          <button className={`dock-btn ${currentView === "constellation" ? "active" : ""}`} title="Constellation Map" onClick={() => setCurrentView("constellation")}>
            <ConstellationIcon size={22} />
          </button>
          <button className="dock-btn" title="Chat with Byeol" onClick={() => setChatOpen(!chatOpen)}>
            <ChatIcon size={22} />
          </button>
          <LessonBadge onLoadLesson={handleLoadLesson} />
          <div style={{ flex: 1 }} />
          <div className="dock-divider" />
          <FileUploader onUpload={handleFileUpload} />
          <button className="dock-btn" title="Voice Mode">
            <MicIcon size={22} />
          </button>
        </div>

        <div className="workspace">
          <div className="glass workspace-header">
            <div className="header-left">
              <div className="header-title" dangerouslySetInnerHTML={{ __html: titles[currentView] }} />
              <div className="love-badge">
                <HeartIcon size={14} />
                <span>Made with love for Dal</span>
              </div>
            </div>
            {currentView === "workspace" && (
              <div className="tab-bar">
                <button className="tab active">Editor</button>
                <button className="tab">Preview</button>
                <button className="tab">Split</button>
              </div>
            )}
          </div>
          <div className="view-container glass">
            {views[currentView]}
          </div>
        </div>

        <div className={`glass chat-panel ${chatOpen ? "open" : ""}`}>
          <ChatWindow onCodeUpdate={handleCodeUpdate} setIsLoading={setIsLoading} />
        </div>
      </div>

      <InstallButton />
    </>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
