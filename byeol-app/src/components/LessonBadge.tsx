"use client";

import React, { useState, useEffect } from "react";
import { memory } from "@/lib/memory";
import { CalendarIcon, CloseIcon, BookOpenIcon } from "./SvgIcons";

const lessons = [
  { title: "CSS Heartbeat Animation", duration: "5 min", topic: "css", code: `<!-- CSS Heartbeat Animation -->
<style>
  .heart { font-size: 5rem; animation: heartbeat 1.2s ease-in-out infinite; text-align: center; margin-top: 2rem; }
  @keyframes heartbeat { 0%,100%{transform:scale(1)} 25%{transform:scale(1.1)} 50%{transform:scale(1)} 75%{transform:scale(1.05)} }
  body { background: #1a1a2e; color: white; font-family: sans-serif; }
</style>
<div class="heart">❤️</div>
<p style="text-align:center;color:#ff6b9d;">Dal's Heartbeat</p>` },
  { title: "HTML Structure for Med Students", duration: "4 min", topic: "html", code: `<!-- HTML Structure -->
<div style="max-width:400px;margin:2rem auto;padding:2rem;background:linear-gradient(135deg,#ff6b9d,#a855f7);border-radius:20px;color:white;font-family:sans-serif;">
  <h1>👋 Hello, I'm Dal!</h1>
  <p>I'm studying Clinical Medicine and learning to code.</p>
  <button style="padding:0.75rem 1.5rem;border:none;border-radius:12px;background:white;color:#a855f7;font-weight:bold;cursor:pointer;margin-top:1rem;">Click me!</button>
</div>` },
  { title: "JavaScript Event Listeners", duration: "6 min", topic: "js", code: `<!-- JavaScript Events -->
<div id="app" style="text-align:center;margin-top:2rem;font-family:sans-serif;color:white;">
  <h1>Count: <span id="count">0</span></h1>
  <button onclick="increment()" style="padding:1rem 2rem;font-size:1.2rem;border:none;border-radius:12px;background:linear-gradient(135deg,#00f0ff,#a855f7);color:white;cursor:pointer;">Click me!</button>
  <p id="message" style="margin-top:1rem;color:#ff6b9d;"></p>
</div>
<script>
  let count = 0;
  function increment() {
    count++;
    document.getElementById('count').textContent = count;
    const msgs = ["Keep going!","You're amazing!","Star power!","Byeol is proud!"];
    document.getElementById('message').textContent = msgs[count % msgs.length];
  }
</script>` },
  { title: "Responsive Design Basics", duration: "5 min", topic: "css", code: `<!-- Responsive Design -->
<style>
  .card { max-width: 100%; padding: 2rem; background: linear-gradient(135deg, #a855f7, #00f0ff); border-radius: 20px; color: white; font-family: sans-serif; }
  @media (min-width: 600px) { .card { max-width: 500px; margin: 2rem auto; } }
</style>
<div class="card">
  <h1>Responsive Card</h1>
  <p>This card adapts to any screen size. Try resizing your browser!</p>
</div>` },
];

interface LessonBadgeProps {
  onLoadLesson: (code: string, title: string) => void;
}

export default function LessonBadge({ onLoadLesson }: LessonBadgeProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem("byeol-lesson-date");
    if (lastSeen === today) setSeen(true);

    const savedIndex = parseInt(localStorage.getItem("byeol-lesson-index") || "0");
    setCurrentLesson(savedIndex % lessons.length);
  }, []);

  const fetchLesson = () => {
    const lesson = lessons[currentLesson];
    onLoadLesson(lesson.code, lesson.title);
    const today = new Date().toDateString();
    localStorage.setItem("byeol-lesson-date", today);
    localStorage.setItem("byeol-lesson-index", String(currentLesson + 1));
    setSeen(true);
    setShowModal(false);
  };

  const lesson = lessons[currentLesson];

  return (
    <>
      <button
        className="dock-btn"
        title="Daily Lesson"
        onClick={() => setShowModal(true)}
      >
        <CalendarIcon size={22} />
        {!seen && <span className="badge" />}
      </button>

      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-lg" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>
              <BookOpenIcon size={40} />
            </div>
            <h2>Today's Lesson</h2>
            <p style={{ marginBottom: 8, fontSize: "1.1rem", fontWeight: 600 }}>{lesson.title}</p>
            <p style={{ marginBottom: 24 }}>A {lesson.duration} micro-project to level up your skills. Byeol will guide you through every step.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="neon-btn" onClick={fetchLesson} style={{ flex: 1 }}>
                Start Lesson
              </button>
              <button
                className="neon-btn"
                onClick={() => setShowModal(false)}
                style={{ flex: 1, background: "var(--glass-bg)", color: "var(--text-secondary)" }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
