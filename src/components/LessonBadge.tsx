"use client";
import { useState, useEffect } from "react";

export default function LessonBadge() {
  const [showModal, setShowModal] = useState(false);
  const [lesson, setLesson] = useState("");
  const [loading, setLoading] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem("byeol-lesson-date");
    if (lastSeen === today) {
      setSeen(true);
    }
  }, []);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/daily-lesson");
      const data = await res.json();
      if (data.lesson) {
        setLesson(data.lesson);
        const today = new Date().toDateString();
        localStorage.setItem("byeol-lesson-date", today);
        setSeen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!seen) {
      fetchLesson();
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative p-2 rounded-full bg-[var(--surface)] border border-[var(--border)]"
        title="Today's lesson"
      >
        📅
        {!seen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--surface)", color: "var(--text)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">⭐ Today's Lesson</h2>
              <button onClick={() => setShowModal(false)} className="text-xl">✕</button>
            </div>
            {loading ? (
              <p>Crafting your lesson with love...</p>
            ) : lesson ? (
              <div className="prose prose-pink whitespace-pre-wrap">{lesson}</div>
            ) : (
              <p>No lesson yet. Click the bell to generate one!</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
