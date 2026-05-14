// src/components/Dashboard.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CodeIcon,
  SparklesIcon,
  ConstellationIcon,
  ChatIcon,
  FileIcon,
  ZapIcon,
  SettingsIcon,
  CheckIcon,
  CloseIcon,
  HeartIcon,
  StarIcon,
  GlobeIcon,
} from "./SvgIcons";

interface TileData {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
  action: string;
  color: string;
  glow: string;
}

interface UserStats {
  projects: number;
  lessons: number;
  streak: number;
}

interface DashboardPrefs {
  hiddenTiles: string[];
}

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export default function Dashboard({ isOpen, onClose, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<UserStats>({ projects: 0, lessons: 0, streak: 0 });
  const [hiddenTiles, setHiddenTiles] = useState<string[]>([]);
  const [showCustomize, setShowCustomize] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const allTiles: TileData[] = [
    // ... (tiles array unchanged)
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const { memory } = await import("@/lib/memory"); // ✅ fixed
        const projects = await memory.getProjects();
        const profile = await memory.getProfile();
        const prefs = await memory.getDashboardPrefs();

        setStats({
          projects: projects?.length || 0,
          lessons: profile?.lessons || 0,
          streak: profile?.streak || 0,
        });

        if (prefs?.hiddenTiles) {
          setHiddenTiles(prefs.hiddenTiles);
        }
      } catch {
        // Use defaults
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleTileClick = useCallback(
    (tile: TileData) => {
      if (tile.action === "customize") {
        setShowCustomize(true);
        return;
      }
      if (tile.action) {
        onNavigate(tile.action);
        onClose();
      }
    },
    [onNavigate, onClose]
  );

  const toggleTileVisibility = useCallback(async (tileId: string) => {
    setHiddenTiles((prev) => {
      const next = prev.includes(tileId)
        ? prev.filter((id) => id !== tileId)
        : [...prev, tileId];

      (async () => {
        try {
          const { memory } = await import("@/lib/memory"); // ✅ fixed
          await memory.setDashboardPrefs({ hiddenTiles: next });
        } catch {}
      })();

      return next;
    });
  }, []);

  const visibleTiles = allTiles.filter((tile) => !hiddenTiles.includes(tile.id));

  if (!isVisible && !isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full w-80 glass-panel border-r border-glass-border flex flex-col">
          <div className="p-6 border-b border-glass-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aurora to-comet flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)]">
                  <HeartIcon size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-starlight">Byeol</h2>
                  <p className="text-xs text-starlight/50">For Dal</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors md:hidden"
                aria-label="Close dashboard"
              >
                <CloseIcon size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {visibleTiles.map((tile, index) => (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  className="glass-surface p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group relative overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${tile.glow}, transparent 70%)` }}
                  />
                  <div className="relative z-10">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${tile.color}20`, color: tile.color }}
                    >
                      {tile.icon}
                    </div>
                    <h3 className="font-display font-semibold text-sm text-starlight mb-1">{tile.title}</h3>
                    <p className="text-xs text-starlight/50 leading-relaxed">{tile.description}</p>
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-starlight/30 font-medium">
                      {tile.meta}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="glass-surface p-4 rounded-xl">
              <h3 className="font-display font-semibold text-sm text-starlight mb-4 flex items-center gap-2">
                <GlobeIcon size={16} className="text-aurora" />
                Your Journey
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="font-display text-2xl font-bold text-aurora">{stats.projects}</div>
                  <div className="text-[10px] text-starlight/50 uppercase tracking-wider mt-1">Projects</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="font-display text-2xl font-bold text-comet">{stats.lessons}</div>
                  <div className="text-[10px] text-starlight/50 uppercase tracking-wider mt-1">Lessons</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="font-display text-2xl font-bold text-solar">{stats.streak}</div>
                  <div className="text-[10px] text-starlight/50 uppercase tracking-wider mt-1">Day Streak</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-glass-border">
            <p className="text-center text-xs text-starlight/30">Made with love for Dal</p>
          </div>
        </div>
      </aside>

      {showCustomize && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCustomize(false)} />
          <div className="glass-panel w-full max-w-md relative z-10 p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-starlight">Customize Dashboard</h3>
              <button onClick={() => setShowCustomize(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <CloseIcon size={18} />
              </button>
            </div>
            <p className="text-sm text-starlight/60 mb-4">Select which tiles to display on your dashboard:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allTiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => toggleTileVisibility(tile.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    !hiddenTiles.includes(tile.id)
                      ? "bg-white/10 border border-white/20"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${tile.color}20`, color: tile.color }}
                  >
                    {React.cloneElement(tile.icon as React.ReactElement, { size: 16 })}
                  </div>
                  <span className="text-sm text-starlight flex-1 text-left">{tile.title}</span>
                  {!hiddenTiles.includes(tile.id) && <CheckIcon size={16} className="text-success flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
