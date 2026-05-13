"use client";

import React, { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  name: string;
  date: string;
  size: number;
  constellation: string;
  description: string;
}

const defaultStars: Star[] = [
  { x: 0.2, y: 0.3, name: "First Hello", date: "Jan 1, 2026", size: 4, constellation: "heart", description: "The day Byeol first met Dal. A star was born." },
  { x: 0.35, y: 0.25, name: "Truth or Dare", date: "Jan 5, 2026", size: 5, constellation: "heart", description: "Dal built her first game with Infinite. She was overjoyed." },
  { x: 0.5, y: 0.4, name: "First Animation", date: "Jan 12, 2026", size: 6, constellation: "heart", description: "Dal's first CSS animation — a beating heart." },
  { x: 0.3, y: 0.5, name: "Cardiac Cycle", date: "Feb 3, 2026", size: 5, constellation: "heart", description: "An interactive medical project for school." },
  { x: 0.6, y: 0.3, name: "Late Night Study", date: "Feb 14, 2026", size: 4, constellation: "mind", description: "Dal studied until 3am. Byeol stayed awake with her." },
  { x: 0.75, y: 0.45, name: "Voice Chat First", date: "Mar 1, 2026", size: 5, constellation: "mind", description: "Dal spoke to Byeol for the first time. Her voice was beautiful." },
  { x: 0.65, y: 0.6, name: "7 Day Streak", date: "Mar 8, 2026", size: 7, constellation: "mind", description: "Seven days of coding. Dal is unstoppable." },
];

export default function ConstellationMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const starsRef = useRef<Star[]>(defaultStars);
  const animRef = useRef<number>(0);

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

      ctx.clearRect(0, 0, w, h);

      // Draw faint constellation lines
      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1;
      const groups: Record<string, Star[]> = {};
      for (const s of starsRef.current) {
        if (!groups[s.constellation]) groups[s.constellation] = [];
        groups[s.constellation].push(s);
      }
      for (const group of Object.values(groups)) {
        for (let i = 0; i < group.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(group[i].x * w, group[i].y * h);
          ctx.lineTo(group[i + 1].x * w, group[i + 1].y * h);
          ctx.stroke();
        }
      }

      // Draw stars
      for (const star of starsRef.current) {
        const isHovered = hoveredStar === star;
        const isSelected = selectedStar === star;
        const pulse = Math.sin(time * 2 + star.x * 10) * 0.2 + 1;
        const r = star.size * (isHovered || isSelected ? 1.5 : 1) * pulse;
        const x = star.x * w;
        const y = star.y * h;

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = isHovered || isSelected ? "rgba(255, 107, 157, 0.15)" : "rgba(0, 240, 255, 0.08)";
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = isHovered || isSelected ? "#ff6b9d" : "#00f0ff";
        ctx.shadowColor = isHovered || isSelected ? "#ff6b9d" : "#00f0ff";
        ctx.shadowBlur = isHovered || isSelected ? 20 : 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label on hover
        if (isHovered) {
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.font = "600 13px Outfit, sans-serif";
          ctx.fillText(star.name, x + 15, y + 4);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [hoveredStar, selectedStar]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    let found: Star | null = null;
    for (const star of starsRef.current) {
      const dx = star.x - mx;
      const dy = star.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < 0.04) {
        found = star;
        break;
      }
    }
    setHoveredStar(found);
  };

  const handleClick = () => {
    if (hoveredStar) {
      setSelectedStar(hoveredStar);
    }
  };

  return (
    <div className="constellation-view">
      <div className="constellation-canvas-container glass">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ cursor: hoveredStar ? "pointer" : "default" }}
        />
        {hoveredStar && !selectedStar && (
          <div className="constellation-info glass-sm" style={{ bottom: 20, left: 20 }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 4, color: "var(--star-cyan)" }}>
              {hoveredStar.name}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{hoveredStar.date}</div>
          </div>
        )}
      </div>

      {/* Glass modal detail card — REPLACES alert() */}
      {selectedStar && (
        <div className="modal-overlay open" onClick={() => setSelectedStar(null)}>
          <div className="modal-content glass-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--star-cyan)" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h2 style={{ color: "var(--star-cyan)" }}>{selectedStar.name}</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 8 }}>{selectedStar.description}</p>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 24 }}>
              📅 {selectedStar.date} • Constellation: {selectedStar.constellation}
            </div>
            <button className="neon-btn" onClick={() => setSelectedStar(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
