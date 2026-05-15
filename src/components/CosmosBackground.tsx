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

interface FallingStar {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface NebulaOrb {
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  phase: number;
}

export default function CosmosBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const fallingStarsRef = useRef<FallingStar[]>([]);
  const nebulaOrbsRef = useRef<NebulaOrb[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(64));
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = [
      "#ffffff", "#00d4ff", "#c084fc", "#ff6b9d",
      "#a855f7", "#22d3ee", "#f59e0b", "#10b981",
    ];
    const weights = [0.4, 0.15, 0.15, 0.1, 0.08, 0.05, 0.04, 0.03];

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
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx!.scale(dpr, dpr);
      initStars();
      initFallingStars();
      initNebulaOrbs();
    }

    function initStars() {
      const count = Math.min(800, Math.floor(window.innerWidth * 0.5));
      starsRef.current = [];
      for (let i = 0; i < count; i++) {
        starsRef.current.push({
          x: Math.random(),
          y: Math.random(),
          z: Math.random() * 3 + 0.5,
          size: Math.random() * 1.8 + 0.2,
          opacity: Math.random() * 0.7 + 0.15,
          twinkleSpeed: Math.random() * 0.025 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          color: pickColor(),
        });
      }
    }

    function initFallingStars() {
      const count = Math.min(150, Math.floor(window.innerWidth * 0.1));
      fallingStarsRef.current = [];
      for (let i = 0; i < count; i++) {
        fallingStarsRef.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 2.5 + 0.5,
          speed: Math.random() * 0.4 + 0.1,
          opacity: Math.random(),
        });
      }
    }

    function initNebulaOrbs() {
      nebulaOrbsRef.current = [
        { x: 0.15, y: 0.25, color: "#c084fc", size: 0.3, speed: 0.25, phase: 0 },
        { x: 0.75, y: 0.7, color: "#00d4ff", size: 0.25, speed: 0.4, phase: 2 },
        { x: 0.6, y: 0.3, color: "#ff6b9d", size: 0.2, speed: 0.35, phase: 4 },
        { x: 0.3, y: 0.8, color: "#a855f7", size: 0.15, speed: 0.5, phase: 1 },
      ];
    }

    function spawnShootingStar() {
      const startY = Math.random() * 0.3;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      shootingStarsRef.current.push({
        x: Math.random() * 0.5,
        y: startY,
        vx: Math.cos(angle) * 0.01,
        vy: Math.sin(angle) * 0.01,
        life: 1,
        decay: 0.012 + Math.random() * 0.008,
        trail: [],
      });
    }

    function drawNebulaOrbs(time: number) {
      if (!canvas || !ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const audioBoost = audioDataRef.current.reduce((a, b) => a + b, 0) / (audioDataRef.current.length * 255);

      for (const orb of nebulaOrbsRef.current) {
        const floatX = Math.sin(time * orb.speed + orb.phase) * 0.03;
        const floatY = Math.cos(time * orb.speed * 0.7 + orb.phase) * 0.03;
        const r = orb.size * Math.min(w, h) * (1 + audioBoost * 0.6);
        const gradient = ctx.createRadialGradient(
          (orb.x + floatX) * w, (orb.y + floatY) * h, 0,
          (orb.x + floatX) * w, (orb.y + floatY) * h, r
        );
        gradient.addColorStop(0, orb.color + "20");
        gradient.addColorStop(0.4, orb.color + "0a");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }
    }

    function drawConstellationLines(w: number, h: number) {
      if (!ctx) return;
      const threshold = 0.1;
      ctx.strokeStyle = "rgba(192, 132, 252, 0.04)";
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

    function drawStars(time: number, w: number, h: number) {
      if (!ctx) return;
      for (const star of starsRef.current) {
        const parallaxX = mouseRef.current.active ? mouseRef.current.x * star.z * 20 : 0;
        const parallaxY = mouseRef.current.active ? mouseRef.current.y * star.z * 20 : 0;
        const sx = ((star.x * w + parallaxX) % w + w) % w;
        const sy = ((star.y * h + parallaxY) % h + h) % h;
        const twinkle = Math.sin(time * star.twinkleSpeed * 100 + star.twinklePhase) * 0.35 + 0.65;
        const alpha = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(sx, sy, star.size * star.z * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        if (star.z > 2 && alpha > 0.35) {
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * star.z * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha * 0.08;
          ctx.fill();
        }
      }
    }

    function drawFallingStars(w: number, h: number) {
      if (!ctx) return;
      for (const star of fallingStarsRef.current) {
        star.y += star.speed;
        if (star.y > h) {
          star.y = 0;
          star.x = Math.random() * w;
        }
        star.opacity += (Math.random() - 0.5) * 0.025;
        star.opacity = Math.max(0.05, Math.min(1, star.opacity));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.5})`;
        ctx.fill();
      }
    }

    function drawShootingStars(w: number, h: number) {
      if (!ctx) return;
      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const s = shootingStarsRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        s.trail.push({ x: s.x, y: s.y, life: s.life });
        if (s.trail.length > 25) s.trail.shift();

        if (s.life <= 0 || s.x > 1.2 || s.y > 1.2) {
          shootingStarsRef.current.splice(i, 1);
          continue;
        }

        for (let j = 0; j < s.trail.length - 1; j++) {
          const t = s.trail[j];
          const alpha = (j / s.trail.length) * s.life * 0.9;
          ctx.beginPath();
          ctx.moveTo(t.x * w, t.y * h);
          ctx.lineTo(s.trail[j + 1].x * w, s.trail[j + 1].y * h);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 2.5 * alpha;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, 2.5 * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
        ctx.fill();
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const time = Date.now() * 0.001;

      ctx.clearRect(0, 0, w, h);
      drawNebulaOrbs(time);
      drawConstellationLines(w, h);
      drawStars(time, w, h);
      drawFallingStars(w, h);
      drawShootingStars(w, h);
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current.active = true;
    });

    const shootingStarInterval = setInterval(() => {
      if (Math.random() < 0.35) spawnShootingStar();
    }, 2500);

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(shootingStarInterval);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    (window as any).__updateCosmosAudio = (data: Uint8Array) => {
      audioDataRef.current = data;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
