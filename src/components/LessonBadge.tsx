"use client";

import { StarIcon, ArrowRightIcon } from "@/components/SvgIcons";

interface LessonBadgeProps {
  title: string;
  duration: string;
  onClick: () => void;
}

export default function LessonBadge({ title, duration, onClick }: LessonBadgeProps) {
  return (
    <div
      className="floating-lesson glass"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Today's lesson: ${title}, ${duration}`}
    >
      <span className="icon">
        <StarIcon />
      </span>
      <div className="text-content">
        <div className="text">Today&apos;s Micro-Lesson is Ready</div>
        <div className="sub">
          {title} — {duration}
        </div>
      </div>
      <ArrowRightIcon style={{ width: 16, height: 16, stroke: "var(--text-secondary)" }} />
    </div>
  );
}
