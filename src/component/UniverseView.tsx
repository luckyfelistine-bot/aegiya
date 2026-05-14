"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type UniverseScene = "home" | "city" | "vacation" | "family" | "future";

interface UniverseViewProps {
  scene: UniverseScene;
  onSceneChange: (scene: UniverseScene) => void;
  onOpenChat: () => void;
  onOpenWorkspace: () => void;
}

// Scene configurations
const SCENE_CONFIGS: Record<UniverseScene, SceneConfig> = {
  home: {
    title: "Our Home",
    subtitle: "Where our story began",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    elements: [
      { type: "house", x: 50, y: 60, label: "Our Home", emoji: "🏠", scale: 1.2 },
      { type: "heart", x: 50, y: 45, label: "Our Love", emoji: "💕", scale: 0.8, pulse: true },
      { type: "tree", x: 20, y: 70, label: "Garden", emoji: "🌳", scale: 0.9 },
      { type: "tree", x: 80, y: 70, label: "Garden", emoji: "🌳", scale: 0.9 },
      { type: "moon", x: 85, y: 15, label: "Moon", emoji: "🌙", scale: 0.6 },
      { type: "star", x: 15, y: 20, label: "Star", emoji: "✨", scale: 0.4 },
      { type: "star", x: 25, y: 15, label: "Star", emoji: "✨", scale: 0.3 },
      { type: "star", x: 70, y: 25, label: "Star", emoji: "✨", scale: 0.35 },
    ],
  },
  city: {
    title: "Our City",
    subtitle: "Building our dreams together",
    bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    elements: [
      { type: "building", x: 20, y: 55, label: "Dal's Hospital", emoji: "🏥", scale: 1.3 },
      { type: "building", x: 50, y: 50, label: "Our Apartment", emoji: "🏢", scale: 1.1 },
      { type: "building", x: 80, y: 55, label: "Tech Hub", emoji: "💻", scale: 1.2 },
      { type: "park", x: 35, y: 75, label: "Central Park", emoji: "🌳", scale: 0.9 },
      { type: "park", x: 65, y: 75, label: "Cafe Corner", emoji: "☕", scale: 0.8 },
      { type: "car", x: 45, y: 85, label: "Our Car", emoji: "🚗", scale: 0.7, move: true },
      { type: "road", x: 50, y: 90, label: "Main Street", emoji: "🛣️", scale: 1.5 },
      { type: "heart", x: 50, y: 35, label: "City Heart", emoji: "💖", scale: 0.6, pulse: true },
    ],
  },
  vacation: {
    title: "Vacation Mode",
    subtitle: "Adventures around the world",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 40%, #533483 100%)",
    elements: [
      { type: "plane", x: 50, y: 30, label: "Our Flight", emoji: "✈️", scale: 1, move: true },
      { type: "beach", x: 25, y: 70, label: "Maldives", emoji: "🏖️", scale: 1.1 },
      { type: "mountain", x: 75, y: 60, label: "Switzerland", emoji: "🏔️", scale: 1.2 },
      { type: "temple", x: 15, y: 50, label: "Japan", emoji: "⛩️", scale: 0.9 },
      { type: "eiffel", x: 85, y: 55, label: "Paris", emoji: "🗼", scale: 1 },
      { type: "pyramid", x: 60, y: 75, label: "Egypt", emoji: "🔺", scale: 0.8 },
      { type: "heart", x: 50, y: 50, label: "Travel Love", emoji: "💕", scale: 0.7, pulse: true },
      { type: "cloud", x: 30, y: 20, label: "Sky", emoji: "☁️", scale: 0.6, move: true },
      { type: "cloud", x: 70, y: 25, label: "Sky", emoji: "☁️", scale: 0.5, move: true },
    ],
  },
  family: {
    title: "Our Family",
    subtitle: "The future we're building",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #1a0a2e 100%)",
    elements: [
      { type: "family", x: 50, y: 55, label: "Us", emoji: "👫", scale: 1.2 },
      { type: "baby", x: 40, y: 65, label: "Baby 1", emoji: "👶", scale: 0.7, pulse: true },
      { type: "baby", x: 60, y: 65, label: "Baby 2", emoji: "👶", scale: 0.7, pulse: true },
      { type: "dog", x: 30, y: 70, label: "Our Dog", emoji: "🐕", scale: 0.8 },
      { type: "cat", x: 70, y: 70, label: "Our Cat", emoji: "🐈", scale: 0.7 },
      { type: "house", x: 50, y: 40, label: "Family Home", emoji: "🏡", scale: 1 },
      { type: "heart", x: 50, y: 25, label: "Family Love", emoji: "❤️", scale: 0.8, pulse: true },
      { type: "tree", x: 15, y: 60, label: "Oak Tree", emoji: "🌳", scale: 1 },
      { type: "tree", x: 85, y: 60, label: "Oak Tree", emoji: "🌳", scale: 1 },
    ],
  },
  future: {
    title: "Our Future",
    subtitle: "Forever together",
    bg: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2d1b4e 100%)",
    elements: [
      { type: "ring", x: 50, y: 45, label: "Engagement", emoji: "💍", scale: 1, pulse: true },
      { type: "ring", x: 50, y: 55, label: "Wedding", emoji: "💒", scale: 1.2, pulse: true },
      { type: "house", x: 30, y: 70, label: "Dream House", emoji: "🏰", scale: 1.3 },
      { type: "car", x: 70, y: 75, label: "Dream Car", emoji: "🚙", scale: 1 },
      { type: "graduation", x: 20, y: 50, label: "Dr. Dal", emoji: "🎓", scale: 1 },
      { type: "trophy", x: 80, y: 50, label: "Success", emoji: "🏆", scale: 1 },
      { type: "heart", x: 50, y: 30, label: "Forever", emoji: "💖", scale: 1, pulse: true },
      { type: "star", x: 10, y: 15, label: "Bright Future", emoji: "⭐", scale: 0.8 },
      { type: "star", x: 90, y: 15, label: "Bright Future", emoji: "⭐", scale: 0.8 },
      { type: "star", x: 50, y: 10, label: "Bright Future", emoji: "⭐", scale: 1, pulse: true },
    ],
  },
};

interface SceneConfig {
  title: string;
  subtitle: string;
  bg: string;
  elements: UniverseElement[];
}

interface UniverseElement {
  type: string;
  x: number;
  y: number;
  label: string;
  emoji: string;
  scale: number;
  pulse?: boolean;
  move?: boolean;
}

export default function UniverseView({
  scene,
  onSceneChange,
  onOpenChat,
  onOpenWorkspace,
}: UniverseViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredElement, setHoveredElement] = useState<UniverseElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<UniverseElement | null>(null);
  const [showSceneMenu, setShowSceneMenu] = useState(false);
  const animRef = useRef<number>(0);

  const config = SCENE_CONFIGS[scene];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const time = Date.now() * 0.001;

      // Clear with scene background
      ctx.fillStyle = config.bg;
      ctx.fillRect(0, 0, w, h);

      // Draw stars background
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      for (let i = 0; i < 50; i++) {
        const sx = ((i * 137.5) % w);
        const sy = ((i * 73.3) % h);
        const twinkle = Math.sin(time + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * 0.6;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw elements
      config.elements.forEach((el) => {
        const isHovered = hoveredElement === el;
        const isSelected = selectedElement === el;
        const pulse = el.pulse ? Math.sin(time * 2) * 0.15 + 1 : 1;
        const moveX = el.move ? Math.sin(time + el.x) * 3 : 0;
        const moveY = el.move ? Math.cos(time * 0.7 + el.y) * 2 : 0;
        const scale = el.scale * (isHovered || isSelected ? 1.3 : 1) * pulse;
        const x = (el.x / 100) * w + moveX;
        const y = (el.y / 100) * h + moveY;

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, 40 * scale, 0, Math.PI * 2);
        ctx.fillStyle = isHovered || isSelected
          ? "rgba(255, 107, 157, 0.2)"
          : "rgba(0, 240, 255, 0.1)";
        ctx.fill();

        // Emoji
        ctx.font = `${60 * scale}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = isHovered || isSelected ? "#ff6b9d" : "#00f0ff";
        ctx.shadowBlur = isHovered || isSelected ? 20 : 10;
        ctx.fillText(el.emoji, x, y);
        ctx.shadowBlur = 0;

        // Label on hover
        if (isHovered) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "600 14px 'Outfit', sans-serif";
          ctx.fillText(el.label, x, y + 40 * scale);
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [config, hoveredElement, selectedElement]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;

    let found: UniverseElement | null = null;
    for (const el of config.elements) {
      const dx = el.x - mx;
      const dy = el.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < 8) {
        found = el;
        break;
      }
    }
    setHoveredElement(found);
  };

  const handleClick = () => {
    if (hoveredElement) {
      setSelectedElement(hoveredElement);
    }
  };

  return (
    <div className="universe-view">
      {/* Scene Header */}
      <div className="universe-header">
        <div>
          <h1 className="universe-title">{config.title}</h1>
          <p className="universe-subtitle">{config.subtitle}</p>
        </div>
        <button
          className="scene-menu-btn"
          onClick={() => setShowSceneMenu(!showSceneMenu)}
        >
          🌍 Scenes
        </button>
      </div>

      {/* Scene Menu */}
      <AnimatePresence>
        {showSceneMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="scene-menu glass"
          >
            {Object.entries(SCENE_CONFIGS).map(([key, cfg]) => (
              <button
                key={key}
                className={`scene-option ${scene === key ? "active" : ""}`}
                onClick={() => {
                  onSceneChange(key as UniverseScene);
                  setShowSceneMenu(false);
                }}
              >
                <span className="scene-emoji">
                  {key === "home" && "🏠"}
                  {key === "city" && "🏙️"}
                  {key === "vacation" && "✈️"}
                  {key === "family" && "👨‍👩‍👧‍👦"}
                  {key === "future" && "🔮"}
                </span>
                <span>{cfg.title}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className="universe-canvas-container">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ cursor: hoveredElement ? "pointer" : "default" }}
        />

        {/* Selected Element Detail */}
        <AnimatePresence>
          {selectedElement && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="element-detail glass"
            >
              <div className="element-emoji">{selectedElement.emoji}</div>
              <h3>{selectedElement.label}</h3>
              <p>
                {selectedElement.type === "house" && "Our cozy home where we share every moment."}
                {selectedElement.type === "heart" && "The love that powers our entire universe."}
                {selectedElement.type === "building" && "Where we build our dreams and careers."}
                {selectedElement.type === "plane" && "Adventures waiting for us around the world."}
                {selectedElement.type === "baby" && "Our future children, full of joy and love."}
                {selectedElement.type === "ring" && "A promise of forever together."}
                {selectedElement.type === "car" && "Road trips and memories on wheels."}
                {selectedElement.type === "star" && "Shining bright in our shared sky."}
              </p>
              <button
                className="neon-btn"
                onClick={() => setSelectedElement(null)}
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="universe-actions">
        <button className="action-btn" onClick={onOpenChat}>
          <span>💬</span> Talk to Byeol
        </button>
        <button className="action-btn" onClick={onOpenWorkspace}>
          <span>💻</span> Code Together
        </button>
      </div>
    </div>
  );
}
