"use client";
export default function LessonBadge() {
  return (
    <button className="relative p-2 rounded-full bg-[var(--primary)]" title="Today's lesson">
      📅
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
    </button>
  );
}
