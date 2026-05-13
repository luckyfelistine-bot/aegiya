"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  trail: { x: number; y: number; life: number }[];
}

export default function CosmosBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(64));
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#ffffff", "#00f0ff", "#ff6b9d", "#a855f7", "#ffd700"];
    const weights = [0.5, 0.15, 0.15, 0.12, 0.08];

    function pickColor(): string {
      let r = Math.random();
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) return colors[i];
      }
      return colors[0];
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      const count = Math.min(600, Math.floor(window.innerWidth * 0.4));
      starsRef.current = [];
      for (let i = 0; i < count; i++) {
        starsRef.current.push({
          x: Math.random(),
          y: Math.random(),
          z: Math.random() * 3 + 0.5,
          size: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          color: pickColor(),
        });
      }
    }

    function spawnShootingStar() {
      const startY = Math.random() * 0.3;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
      shootingStarsRef.current.push({
        x: Math.random() * 0.5,
        y: startY,
        vx: Math.cos(angle) * 0.008,
        vy: Math.sin(angle) * 0.008,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        trail: [],
      });
    }

    function drawNebulaOrbs(time: number) {
      const w = canvas.width;
      const h = canvas.height;
      const orbs = [
        { x: 0.15, y: 0.2, color: "#ff6b9d", size: 0.25, speed: 0.3 },
        { x: 0.8, y: 0.75, color: "#00f0ff", size: 0.2, speed: 0.5 },
        { x: 0.7, y: 0.35, color: "#a855f7", size: 0.18, speed: 0.4 },
      ];
      const audioBoost = audioDataRef.current.reduce((a, b) => a + b, 0) / (audioDataRef.current.length * 255);

      for (const orb of orbs) {
        const floatX = Math.sin(time * orb.speed) * 0.02;
        const floatY = Math.cos(time * orb.speed * 0.7) * 0.02;
        const r = orb.size * Math.min(w, h) * (1 + audioBoost * 0.5);
        const gradient = ctx.createRadialGradient(
          (orb.x + floatX) * w, (orb.y + floatY) * h, 0,
          (orb.x + floatX) * w, (orb.y + floatY) * h, r
        );
        gradient.addColorStop(0, orb.color + "18");
        gradient.addColorStop(0.5, orb.color + "08");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }
    }

    function drawConstellationLines(w: number, h: number) {
      const threshold = 0.12;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.06)";
      ctx.lineWidth = 0.5;
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < threshold) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x * w, stars[i].y * h);
            ctx.lineTo(stars[j].x * w, stars[j].y * h);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const time = Date.now() * 0.001;

      ctx.clearRect(0, 0, w, h);
      drawNebulaOrbs(time);
      drawConstellationLines(w, h);

      // Draw stars
      for (const star of starsRef.current) {
        const parallaxX = mouseRef.current.active ? mouseRef.current.x * star.z * 15 : 0;
        const parallaxY = mouseRef.current.active ? mouseRef.current.y * star.z * 15 : 0;
        const sx = ((star.x * w + parallaxX) % w + w) % w;
        const sy = ((star.y * h + parallaxY) % h + h) % h;
        const twinkle = Math.sin(time * star.twinkleSpeed * 100 + star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(sx, sy, star.size * star.z * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        if (star.z > 2 && alpha > 0.4) {
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * star.z * 2, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha * 0.1;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Draw shooting stars
      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const s = shootingStarsRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        s.trail.push({ x: s.x, y: s.y, life: s.life });
        if (s.trail.length > 20) s.trail.shift();

        if (s.life <= 0 || s.x > 1.2 || s.y > 1.2) {
          shootingStarsRef.current.splice(i, 1);
          continue;
        }

        for (let j = 0; j < s.trail.length - 1; j++) {
          const t = s.trail[j];
          const alpha = (j / s.trail.length) * s.life * 0.8;
          ctx.beginPath();
          ctx.moveTo(t.x * w, t.y * h);
          ctx.lineTo(s.trail[j + 1].x * w, s.trail[j + 1].y * h);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 2 * alpha;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, 2 * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current.active = true;
    });

    const interval = setInterval(() => {
      if (Math.random() < 0.3) spawnShootingStar();
    }, 3000);

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(interval);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Expose audio data updater
  useEffect(() => {
    (window as any).__updateCosmosAudio = (data: Uint8Array) => {
      audioDataRef.current = data;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="cosmos-canvas"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
