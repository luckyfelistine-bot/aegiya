"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { memory } from "@/lib/memory";
import { speak, startSpeechRecognition } from "@/utils/speech";
import {
  SendIcon,
  MicIcon,
  PaperclipIcon,
  StarIcon,
} from "@/components/SvgIcons";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load messages from IndexedDB on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const saved = await memory.getMessages(50);
        if (saved && saved.length > 0) {
          setMessages(
            saved.map((m: any) => ({
              id: m.id?.toString() || crypto.randomUUID(),
              role: m.role,
              content: m.content,
              timestamp: m.timestamp || Date.now(),
            }))
          );
        } else {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content:
                "Hi Dal! I'm Byeol, your personal star. ✨ How can I help you with coding or studies today?",
              timestamp: Date.now(),
            },
          ]);
        }
      } catch (e) {
        console.error("Failed to load messages:", e);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content:
              "Hi Dal! I'm Byeol, your personal star. ✨ How can I help you with coding or studies today?",
            timestamp: Date.now(),
          },
        ]);
      }
    };
    loadMessages();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const generateId = () =>
    typeof crypto !== "undefined"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  const formatTime = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      // Add user message to UI immediately
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setIsThinking(true);
      setError(null);

      // Save user message to IndexedDB
      try {
        await memory.saveMessage({
          role: "user",
          content: userMsg.content,
          timestamp: userMsg.timestamp,
        });
      } catch (e) {
        console.error("Failed to save user message:", e);
      }

      // Create placeholder for assistant response
      const assistantId = generateId();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          isStreaming: true,
        },
      ]);

      // Build conversation history for API
      const apiMessages = messages
        .filter((m) => m.role !== "system")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      apiMessages.push({ role: "user" as const, content: userMsg.content });

      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body available");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        setIsThinking(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.content || "";
              if (content) {
                fullContent += content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: fullContent, isStreaming: true }
                      : m
                  )
                );
              }
            } catch (e) {
              // Ignore malformed JSON lines
            }
          }
        }

        // Mark streaming as complete
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );

        // Save assistant message to IndexedDB
        if (fullContent) {
          await memory.saveMessage({
            role: "assistant",
            content: fullContent,
            timestamp: Date.now(),
          });

          // Speak the response
          speak(fullContent);
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          // User cancelled, remove the empty assistant message
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          return;
        }

        console.error("Chat error:", err);
        setError(err.message || "Something went wrong. Please try again.");

        // Replace empty assistant message with error
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== assistantId)
            .concat({
              id: generateId(),
              role: "assistant",
              content: `I'm sorry, Dal. I encountered an error: ${err.message}. Please try again in a moment. 💫`,
              timestamp: Date.now(),
            })
        );
      } finally {
        setIsLoading(false);
        setIsThinking(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading]
  );

  const handleVoiceInput = async () => {
    if (isRecording) return;
    setIsRecording(true);
    try {
      const text = await startSpeechRecognition();
      if (text) {
        setInput(text);
        await sendMessage(text);
      }
    } catch (e: any) {
      console.error("Voice input error:", e);
      setError("Voice recognition failed. Please try typing instead.");
    } finally {
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setIsThinking(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/process-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process file");
      }

      const data = await response.json();

      const fileMsg = `I uploaded a file: ${file.name}\n\nContent summary:\n${data.summary || data.content || "File processed successfully"}`;
      await sendMessage(fileMsg);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      // Reset file input
      e.target.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`chat-panel glass ${isOpen ? "open" : ""}`} id="chatPanel">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-avatar">
          <StarIcon />
        </div>
        <div className="chat-name">Byeol</div>
        <div className="chat-status">
          <span className="status-dot"></span>
          <span>Online — Dal&apos;s personal star</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" id="chatMessages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`msg ${msg.role} ${msg.isStreaming ? "streaming" : ""}`}
          >
            <div className="msg-content">
              {msg.role === "assistant" && (
                <div className="msg-avatar-small">
                  <StarIcon />
                </div>
              )}
              <div className="msg-body">
                <div className="msg-text">{msg.content}</div>
                <div className="msg-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="msg assistant thinking">
            <div className="msg-content">
              <div className="msg-avatar-small">
                <StarIcon />
              </div>
              <div className="msg-body">
                <div className="msg-text">
                  <div className="thinking-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="thinking-text">Byeol is thinking...</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Toast */}
      {error && (
        <div className="chat-error" onClick={() => setError(null)}>
          <span>{error}</span>
          <button aria-label="Dismiss error">×</button>
        </div>
      )}

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="input-glass">
          <label className="input-btn" title="Attach file">
            <PaperclipIcon />
            <input
              type="file"
              hidden
              accept=".txt,.html,.css,.js,.pdf,.docx"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </label>

          <button
            className={`input-btn mic ${isRecording ? "recording" : ""}`}
            title={isRecording ? "Recording..." : "Hold to talk"}
            onClick={handleVoiceInput}
            disabled={isLoading}
            aria-label={isRecording ? "Recording" : "Voice input"}
          >
            <MicIcon />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask Byeol anything, Dal..."
            disabled={isLoading}
            aria-label="Chat message"
          />

          <button
            className="input-btn send"
            title="Send"
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
