"use client";
import { useState, useCallback } from "react";
import ChatWindow from "@/components/ChatWindow";
import CodeEditor from "@/components/CodeEditor";
import PreviewFrame from "@/components/PreviewFrame";
import VoiceButton from "@/components/VoiceButton";
import FileUploader from "@/components/FileUploader";
import LessonBadge from "@/components/LessonBadge";

export default function Home() {
  const [code, setCode] = useState("<!-- Write your HTML here -->\n<h1>Hello, Byeol! ✨</h1>");
  const [previewHtml, setPreviewHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Called when AI sends a response that includes a code block
  const handleCodeUpdate = useCallback((newCode: string) => {
    setCode(newCode);
    // Auto-bundle HTML/CSS/JS for the preview (simplified: assume HTML with script tags)
    setPreviewHtml(newCode);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel: Chat + Tools */}
      <div className="w-1/2 min-w-[380px] flex flex-col border-r" style={{ borderColor: "var(--border)" }}>
        <header className="p-4 flex items-center justify-between" style={{ backgroundColor: "var(--surface)" }}>
          <h1 className="text-2xl font-bold text-[var(--primary)]">
            Byeol <span className="text-lg font-normal">⭐</span>
          </h1>
          <div className="flex gap-2">
            <VoiceButton onTranscript={(text) => {
              // We'll wire this up to the chat input later
              console.log("Voice:", text);
            }} />
            <FileUploader />
            <LessonBadge />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--surface)" }}>
          <ChatWindow onCodeUpdate={handleCodeUpdate} setIsLoading={setIsLoading} />
        </div>
      </div>

      {/* Right Panel: Editor + Preview */}
      <div className="flex-1 flex flex-col">
        <div className="h-1/2 overflow-hidden">
          <CodeEditor code={code} onChange={setCode} />
        </div>
        <div className="h-1/2 border-t" style={{ borderColor: "var(--border)" }}>
          <PreviewFrame html={previewHtml} />
        </div>
      </div>
    </div>
  );
}
