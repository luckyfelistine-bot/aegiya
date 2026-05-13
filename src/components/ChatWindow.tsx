"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { memory } from "@/lib/memory";
import { useToast } from "./Toast";
import {
  PaperclipIcon, MicIcon, SendIcon, VolumeIcon, VolumeMuteIcon,
  StarIcon, CloseIcon
} from "./SvgIcons";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface ChatWindowProps {
  onCodeUpdate: (code: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function ChatWindow({ onCodeUpdate, setIsLoading }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi Dal! I'm Byeol, your personal star. ✨ How can I help you with coding or studies today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast, dismissToast } = useToast();
  const abortRef = useRef<AbortController | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Load persisted messages
  useEffect(() => {
    memory.getMessages(50).then((saved) => {
      if (saved.length > 0) {
        setMessages(saved.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })));
      }
    });
    synthRef.current = window.speechSynthesis;
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── STREAMING CHAT WITH GROQ API ───
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMsg: Message = { role: "user", content, timestamp: Date.now() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);
      setIsTyping(true);

      // Save user message
      await memory.saveMessage({ role: "user", content, timestamp: Date.now() });

      try {
        abortRef.current = new AbortController();

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "API error");
        }

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "", timestamp: Date.now() }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.trim()) continue;
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]" || data === "[TRUNCATED]") continue;
              try {
                const parsed = JSON.parse(data);
                const text = parsed.choices?.[0]?.delta?.content || parsed.content || "";
                if (!text) continue;
                assistantContent += text;

                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                    timestamp: Date.now(),
                  };
                  return copy;
                });

                extractLiveContent(assistantContent);
              } catch {
                // ignore malformed chunks
              }
            }
          }
        }

        // Final extraction
        extractLiveContent(assistantContent);

        // Save assistant message
        await memory.saveMessage({
          role: "assistant",
          content: assistantContent,
          timestamp: Date.now(),
        });

        // Update memory summary
        await updateMemory(assistantContent);

        // Auto-speak
        if (autoSpeak && assistantContent.length > 0) {
          speakText(assistantContent);
        }
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.error(error);
        showToast("Oops", "I'm having a moment, Dal. Could you try again? 💛", "error");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'm having a moment, Dal. Could you try again? 💛",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
        abortRef.current = null;
      }
    },
    [messages, autoSpeak, setIsLoading, showToast]
  );

  const extractLiveContent = (content: string) => {
    // Extract code blocks for editor
    const codeBlockRegex = /```(html|css|javascript|js)([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const code = match[2].trim();
      onCodeUpdate(code);
    }

    // Extract artifact blocks
    const artifactRegex = /```artifact\n([\s\S]*?)```/g;
    while ((match = artifactRegex.exec(content)) !== null) {
      try {
        const artifact = JSON.parse(match[1].trim());
        if (artifact.type === "html") {
          onCodeUpdate(artifact.content);
        }
      } catch {
        // ignore invalid artifact
      }
    }
  };

  const updateMemory = async (content: string) => {
    const summary = content.slice(0, 300);
    try {
      await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recent_chat_summary: summary,
          total_lessons_completed: messages.length,
        }),
      });
    } catch (err) {
      console.error("Memory update failed:", err);
    }
  };

  // ─── SPEECH SYNTHESIS ───
  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 1.1;
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.includes("Samantha") ||
        v.name.includes("Karen") ||
        v.name.includes("Victoria") ||
        (v.lang === "en-US" && v.name.includes("Google"))
    );
    if (preferred) utter.voice = preferred;
    synthRef.current.speak(utter);
  };

  // ─── VOICE INPUT ───
  const initRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (e: SpeechRecognitionEvent) => {
        let text = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        setInput(text);
        if (e.results[e.results.length - 1].isFinal) {
          sendMessage(text);
          stopRecording();
        }
      };

      recognitionRef.current.onerror = () => stopRecording();
      recognitionRef.current.onend = () => stopRecording();
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) initRecognition();
    if (!recognitionRef.current) {
      showToast("Voice Unavailable", "Speech recognition requires Chrome. Try typing instead!", "warning");
      return;
    }
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
  };

  // ─── FILE UPLOAD ───
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/process-file", { method: "POST", body: formData });
      const { text, error } = await res.json();
      if (error) {
        showToast("File Error", error, "error");
        return;
      }
      const fileMessage = `I've uploaded a file: "${file.name}". Please summarize it, generate 5 practice questions, and create an interactive study artifact if helpful.\n\n---\n${text}\n---`;
      await sendMessage(fileMessage);
    } catch (err) {
      showToast("Upload Failed", "Could not process the file. Please try again.", "error");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatTime = (ts?: number) => {
    if (!ts) return "Just now";
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-panel glass">
      <div className="chat-header">
        <div className="chat-avatar">
          <StarIcon size={28} />
        </div>
        <div className="chat-name">Byeol</div>
        <div className="chat-status">
          <span className="status-dot" />
          <span>Online — Dal's personal star</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br>") }} />
            <div className="msg-time">{formatTime(msg.timestamp)}</div>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span /><span /><span />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="input-glass">
          <button
            className="input-btn"
            title="Attach file"
            onClick={() => fileInputRef.current?.click()}
          >
            <PaperclipIcon size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.html,.css,.js"
            onChange={handleFileUpload}
          />

          <button
            className={`input-btn mic ${isRecording ? "recording" : ""}`}
            title="Hold to talk"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
          >
            <MicIcon size={18} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask Byeol anything, Dal..."
          />

          <button
            className="input-btn"
            title={autoSpeak ? "Mute voice" : "Unmute voice"}
            onClick={() => setAutoSpeak(!autoSpeak)}
          >
            {autoSpeak ? <VolumeIcon size={18} /> : <VolumeMuteIcon size={18} />}
          </button>

          <button className="input-btn send" title="Send" onClick={() => sendMessage(input)}>
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
