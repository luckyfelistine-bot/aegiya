"use client";

import React, { useState, useEffect } from "react";
import { memory, DashboardPrefs, defaultDashboardPrefs } from "@/lib/memory";
import {
  CodeIcon,
  StarIcon,
  CalendarIcon,
  ConstellationIcon,
  MicIcon,
  FileIcon,
  DoveIcon,
  SparklesIcon,
  SettingsIcon,
} from "./SvgIcons";

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenLesson: () => void;
}

export default function Dashboard({ onNavigate, onOpenLesson }: DashboardProps) {
  const [prefs, setPrefs] = useState<DashboardPrefs>(defaultDashboardPrefs);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState({ projects: 0, sessions: 0, streak: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const dashboardPrefs = await memory.getDashboardPrefs();
        setPrefs(dashboardPrefs);
        const projects = await memory.getProjects();
        setStats((s) => ({ ...s, projects: projects.length }));
        const lessons = await memory.getProfile("lessonsCompleted");
        setStats((s) => ({ ...s, sessions: lessons || 0 }));
        const streak = await memory.getProfile("streak");
        setStats((s) => ({ ...s, streak: streak || 0 }));
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    };
    load();
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
      icon: CodeIcon,
      title: "Continue Coding",
      desc: "Pick up where you left off. Byeol has some new ideas for you.",
      meta: "Last edited: 2 hours ago",
      action: () => onNavigate("workspace"),
    },
    {
      key: "showStatus" as const,
      size: "bento-tall",
      icon: StarIcon,
      title: "Byeol's Status",
      desc: "Byeol is shining bright today. She's ready to help with medicine, coding, or just chat.",
      meta: "Uptime: 47 days",
      action: () => {},
    },
    {
      key: "showLesson" as const,
      size: "bento-medium",
      icon: CalendarIcon,
      title: "Today's Lesson",
      desc: "CSS Heartbeat Animation — 5 min micro-project",
      meta: "New • Tap to start",
      action: onOpenLesson,
    },
    {
      key: "showConstellation" as const,
      size: "bento-medium",
      icon: ConstellationIcon,
      title: "Constellation",
      desc: "Your memory map has 7 stars now. Each one is a moment you and Byeol shared.",
      meta: "7 stars • 2 constellations",
      action: () => onNavigate("constellation"),
    },
    {
      key: "showVoice" as const,
      size: "bento-small",
      icon: MicIcon,
      title: "Voice",
      desc: "Talk to Byeol",
      meta: "Hold to speak",
      action: () => onNavigate("chat"),
    },
    {
      key: "showFiles" as const,
      size: "bento-small",
      icon: FileIcon,
      title: "Files",
      desc: "Upload notes",
      meta: "3 files",
      action: () => {},
    },
    {
      key: "showProgress" as const,
      size: "bento-wide",
      icon: DoveIcon,
      title: "Your Progress",
      desc: `You've completed ${stats.projects} coding micro-projects and ${stats.sessions} medical study sessions. Byeol is incredibly proud of you, Dal.`,
      meta: `${stats.projects} projects • ${stats.sessions} sessions • ${stats.streak} day streak`,
      action: () => {},
    },
  ];

  const visibleTiles = tiles.filter((t) => prefs[t.key]);

  return (
    <div className="bento-grid">
      {visibleTiles.map((tile) => {
        const IconComponent = tile.icon;
        return (
          <div
            key={tile.key}
            className={`bento-tile ${tile.size}`}
            onClick={tile.action}
            tabIndex={0}
            role="button"
          >
            <div className="tile-icon">
              <IconComponent size={24} />
            </div>
            <div className="tile-title">{tile.title}</div>
            <div className="tile-desc">{tile.desc}</div>
            <div className="tile-meta">{tile.meta}</div>
          </div>
        );
      })}

      <div
        className="bento-tile bento-small"
        onClick={() => setShowSettings(true)}
        tabIndex={0}
        role="button"
      >
        <div className="tile-icon">
          <SettingsIcon size={24} />
        </div>
        <div className="tile-title">Customize</div>
        <div className="tile-desc">Choose what you see</div>
        <div className="tile-meta">{visibleTiles.length} tiles visible</div>
      </div>

      {showSettings && (
        <div className="modal-overlay open" onClick={() => setShowSettings(false)}>
          <div className="modal-content glass-lg" onClick={(e) => e.stopPropagation()}>
            <h2>Customize Your Dashboard</h2>
            <p>Choose what Dal wants to see first</p>
            <div style={{ textAlign: "left", marginBottom: 24 }}>
              {tiles.map((tile) => (
                <label
                  key={tile.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--glass-border)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={prefs[tile.key]}
                    onChange={() => togglePref(tile.key)}
                    style={{ width: 18, height: 18, accentColor: "var(--accent-secondary)" }}
                  />
                  <span style={{ fontSize: "0.95rem" }}>{tile.title}</span>
                </label>
              ))}
            </div>
            <button className="neon-btn" onClick={() => setShowSettings(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
