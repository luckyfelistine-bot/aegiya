"use client";

import { useState, useEffect } from "react";
import { memory, type DashboardPrefs, defaultDashboardPrefs } from "@/lib/memory";
import { CodeIcon, HeartIcon, SparklesIcon, ConstellationIcon, MicIcon, FileIcon, BarChartIcon, SettingsIcon, XIcon, ZapIcon, FolderIcon } from "./SvgIcons";

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenLesson?: () => void;
}

export default function Dashboard({ onNavigate, onOpenLesson }: DashboardProps) {
  const [prefs, setPrefs] = useState<DashboardPrefs>(defaultDashboardPrefs);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState({ projects: 0, sessions: 0, streak: 0, files: 0 });

  useEffect(() => {
    memory.getDashboardPrefs().then(setPrefs);
    memory.getProjects().then((p) => setStats((s) => ({ ...s, projects: p.length })));
    memory.getProfile("lessonsCompleted").then((n) => setStats((s) => ({ ...s, sessions: (n as number) || 0 })));
    memory.getProfile("streak").then((n) => setStats((s) => ({ ...s, streak: (n as number) || 0 })));
    memory.getFiles().then((f) => setStats((s) => ({ ...s, files: f.length })));
  }, []);

  const togglePref = async (key: keyof DashboardPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await memory.setDashboardPrefs(next);
  };

  const tiles = [
    {
      key: "showCoding" as const,
      size: "bento-hero",
      icon: <CodeIcon size={32} />,
      title: "Continue Coding",
      desc: "Pick up where you left off. Byeol has some new ideas for you.",
      meta: "Last edited: 2 hours ago",
      action: () => onNavigate("workspace"),
      gradient: "linear-gradient(135deg, rgba(192,132,252,0.1), rgba(0,212,255,0.1))",
    },
    {
      key: "showStatus" as const,
      size: "bento-tall",
      icon: <HeartIcon size={32} />,
      title: "Byeol's Status",
      desc: "Byeol is shining bright today. She's ready to help with medicine, coding, or just chat.",
      meta: "Uptime: 47 days",
      action: () => {},
      gradient: "linear-gradient(135deg, rgba(255,107,157,0.1), rgba(192,132,252,0.1))",
    },
    {
      key: "showLesson" as const,
      size: "bento-medium",
      icon: <SparklesIcon size={32} />,
      title: "Today's Lesson",
      desc: "CSS Heartbeat Animation — 5 min micro-project",
      meta: "New • Tap to start",
      action: onOpenLesson,
      gradient: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(255,107,157,0.1))",
    },
    {
      key: "showConstellation" as const,
      size: "bento-medium",
      icon: <ConstellationIcon size={32} />,
      title: "Constellation",
      desc: "Your memory map has 7 stars now. Each one is a moment you and Byeol shared.",
      meta: "7 stars • 2 constellations",
      action: () => onNavigate("constellation"),
      gradient: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(0,212,255,0.1))",
    },
    {
      key: "showVoice" as const,
      size: "bento-small",
      icon: <MicIcon size={32} />,
      title: "Voice Chat",
      desc: "Talk to Byeol",
      meta: "Hold to speak",
      action: () => onNavigate("chat"),
      gradient: "linear-gradient(135deg, rgba(34,211,238,0.1), rgba(192,132,252,0.1))",
    },
    {
      key: "showFiles" as const,
      size: "bento-small",
      icon: <FolderIcon size={32} />,
      title: "Files",
      desc: "Manage projects",
      meta: `${stats.files} files`,
      action: () => onNavigate("workspace"),
      gradient: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(34,211,238,0.1))",
    },
    {
      key: "showProgress" as const,
      size: "bento-wide",
      icon: <BarChartIcon size={32} />,
      title: "Your Progress",
      desc: `You've completed ${stats.projects} coding micro-projects and ${stats.sessions} medical study sessions. Byeol is incredibly proud of you, Dal.`,
      meta: `${stats.projects} projects • ${stats.sessions} sessions • ${stats.streak} day streak`,
      action: () => {},
      gradient: "linear-gradient(135deg, rgba(192,132,252,0.08), rgba(0,212,255,0.08), rgba(255,107,157,0.08))",
    },
  ];

  const visibleTiles = tiles.filter((t) => prefs[t.key]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, Dal</h1>
          <p className="dashboard-subtitle">Byeol has been waiting for you ✨</p>
        </div>
        <button
          className="glass-button"
          onClick={() => setShowSettings(true)}
          style={{ borderRadius: "var(--radius-full)", width: 44, height: 44, padding: 0 }}
        >
          <SettingsIcon size={18} />
        </button>
      </div>

      <div className="bento-grid">
        {visibleTiles.map((tile, i) => (
          <div
            key={tile.key}
            className={`bento-tile ${tile.size}`}
            onClick={tile.action}
            style={{
              animationDelay: `${i * 0.06}s`,
              background: tile.gradient,
            }}
          >
            <div className="tile-icon">{tile.icon}</div>
            <div className="tile-title">{tile.title}</div>
            <div className="tile-desc">{tile.desc}</div>
            <div className="tile-meta">{tile.meta}</div>
          </div>
        ))}
      </div>

      {showSettings && (
        <>
          <div className="sidebar-overlay open" onClick={() => setShowSettings(false)} />
          <div className="dashboard-sidebar open">
            <div className="dashboard-sidebar-header">
              <button
                onClick={() => setShowSettings(false)}
                style={{ background: "none", border: "none", color: "var(--lunar)", cursor: "pointer" }}
              >
                <XIcon size={20} />
              </button>
            </div>
            <div className="dashboard-sidebar-content">
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }} className="text-gradient">
                Customize Dashboard
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--lunar)", marginBottom: 20 }}>
                Choose what Dal wants to see first
              </p>
              {tiles.map((tile) => (
                <label
                  key={tile.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 0",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--glass-border)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={prefs[tile.key]}
                    onChange={() => togglePref(tile.key)}
                    style={{ width: 20, height: 20, accentColor: "var(--accent)", cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ opacity: 0.7 }}>{tile.icon}</span>
                    <span style={{ fontSize: "0.92rem" }}>{tile.title}</span>
                  </div>
                </label>
              ))}
              <p style={{ fontSize: "0.8rem", color: "var(--lunar)", marginTop: 20 }}>
                {visibleTiles.length} of {tiles.length} tiles visible
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
