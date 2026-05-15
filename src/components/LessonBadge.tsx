"use client";

import { ArrowRightIcon } from "./SvgIcons";

interface LessonBadgeProps {
  title: string;
  duration: string;
  onClick?: () => void;
}

export default function LessonBadge({ title, duration, onClick }: LessonBadgeProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        background: "var(--glass)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--accent)";
        el.style.boxShadow = "0 0 20px var(--accent-glow)";
        el.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--glass-border)";
        el.style.boxShadow = "none";
        el.style.transform = "translateX(0)";
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-full)",
          background: "linear-gradient(135deg, var(--accent), var(--aurora))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 0 16px var(--accent-glow)",
        }}
      >
        <span style={{ fontSize: "1.3rem" }}>✨</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--stardust)", marginBottom: 3 }}>{title}</p>
        <p style={{ fontSize: "0.78rem", color: "var(--lunar)" }}>{duration}</p>
      </div>
      <ArrowRightIcon size={16} style={{ color: "var(--lunar)", flexShrink: 0 }} />
    </button>
  );
}
