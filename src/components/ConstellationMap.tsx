"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  label: string;
  connections: number[];
  size: number;
}

const nodes: Node[] = [
  { x: 0.2, y: 0.3, label: "First Chat", connections: [1, 2], size: 8 },
  { x: 0.5, y: 0.2, label: "Code Session", connections: [2, 3], size: 10 },
  { x: 0.8, y: 0.4, label: "Study Help", connections: [3, 4], size: 7 },
  { x: 0.6, y: 0.7, label: "Voice Chat", connections: [4, 5], size: 9 },
  { x: 0.3, y: 0.8, label: "File Upload", connections: [5, 0], size: 6 },
  { x: 0.15, y: 0.55, label: "Theme Change", connections: [0], size: 7 },
  { x: 0.85, y: 0.75, label: "Project Save", connections: [3, 4], size: 8 },
];

export default function ConstellationMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = parent.clientWidth * dpr;
      canvas!.height = parent.clientHeight * dpr;
      canvas!.style.width = parent.clientWidth + "px";
      canvas!.style.height = parent.clientHeight + "px";
      ctx!.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.parentElement?.clientWidth || window.innerWidth;
      const h = canvas.parentElement?.clientHeight || window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Draw connections with gradient
      for (const node of nodes) {
        for (const conn of node.connections) {
          const target = nodes[conn];
          const gradient = ctx.createLinearGradient(
            node.x * w, node.y * h,
            target.x * w, target.y * h
          );
          gradient.addColorStop(0, "rgba(192, 132, 252, 0.15)");
          gradient.addColorStop(0.5, "rgba(0, 212, 255, 0.1)");
          gradient.addColorStop(1, "rgba(192, 132, 252, 0.15)");

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x * w, node.y * h);
          ctx.lineTo(target.x * w, target.y * h);
          ctx.stroke();
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const nx = node.x * w;
        const ny = node.y * h;
        const pulse = Math.sin(time * 2 + node.x * 10) * 0.2 + 0.8;
        const r = node.size * pulse;

        // Hover detection
        const dist = Math.sqrt((mouseX - nx) ** 2 + (mouseY - ny) ** 2);
        const isHovered = dist < 30;

        // Glow
        const glowR = r * (isHovered ? 5 : 3);
        const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowR);
        gradient.addColorStop(0, isHovered ? "rgba(192, 132, 252, 0.4)" : "rgba(192, 132, 252, 0.2)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nx, ny, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = isHovered ? "#c084fc" : "#a855f7";
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(nx, ny, r + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.7)";
        ctx.font = isHovered ? "600 13px var(--font-body)" : "500 12px var(--font-body)";
        ctx.textAlign = "center";
        ctx.fillText(node.label, nx, ny + r + 22);
      }

      time += 0.016;
      requestAnimationFrame(draw);
    }
    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="constellation-map">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
