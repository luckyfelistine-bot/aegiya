"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SendIcon, PaperclipIcon, XIcon, CopyIcon, PlayIcon, LoaderIcon } from "./SvgIcons";
import VoiceButton from "./VoiceButton";
import FileUploader, { UploadedFile } from "./FileUploader";
import { chatCompletion, CHAT_MODEL, type GroqModel } from "@/lib/groq";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { speak } from "@/utils/speech";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: UploadedFile[];
}

interface ChatWindowProps {
  onClose?: () => void;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi Dal! ✨ I'm Byeol, your cosmic companion. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<GroqModel>(CHAT_MODEL);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() && attachments.length === 0) return;

    const userMsg: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setShowUploader(false);
    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt();
      const apiMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: userMsg.content },
      ];

      const response = await chatCompletion({ messages: apiMessages, model });
      const content = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";

      const assistantMsg: Message = {
        role: "assistant",
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speak(content.slice(0, 200));
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! Something went wrong. Let me try again in a moment. ✨",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, attachments, messages, model]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoice = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const extractCodeBlocks = (content: string) => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: { language: string; code: string }[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      blocks.push({ language: match[1] || "text", code: match[2].trim() });
    }
    return blocks;
  };

  const applyToEditor = (code: string, language: string) => {
    window.dispatchEvent(
      new CustomEvent("byeol:setCode", { detail: { code, language } })
    );
  };

  const renderMessage = (msg: Message) => {
    if (msg.role === "user") {
      return (
        <div className="message user">
          <div className="message-avatar">👤</div>
          <div style={{ maxWidth: "100%" }}>
            <div className="message-bubble">{msg.content}</div>
            {msg.attachments && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                {msg.attachments.map((att, i) => (
                  <span key={i} style={{ fontSize: "0.7rem", color: "var(--lunar)", background: "var(--glass)", padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>
                    📎 {att.name}
                  </span>
                ))}
              </div>
            )}
            <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>
      );
    }

    const codeBlocks = extractCodeBlocks(msg.content);
    const textParts = msg.content.split(/```(\w+)?
[\s\S]*?```/g);

    return (
      <div className="message">
        <div className="message-avatar">✨</div>
        <div style={{ maxWidth: "100%", minWidth: 0 }}>
          <div className="message-bubble">
            {textParts.map((part, i) => (
              <span key={i}>
                {part}
                {codeBlocks[i] && (
                  <div className="code-block" style={{ margin: "10px 0" }}>
                    <div className="code-block-header">
                      <span style={{ fontFamily: "var(--font-mono)" }}>{codeBlocks[i].language}</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => navigator.clipboard.writeText(codeBlocks[i].code)}
                          style={{ background: "none", border: "none", color: "var(--lunar)", cursor: "pointer", padding: 2 }}
                          title="Copy"
                        >
                          <CopyIcon size={12} />
                        </button>
                        <button
                          onClick={() => applyToEditor(codeBlocks[i].code, codeBlocks[i].language)}
                          style={{ background: "none", border: "none", color: "var(--lunar)", cursor: "pointer", padding: 2 }}
                          title="Apply to Editor"
                        >
                          <PlayIcon size={12} />
                        </button>
                      </div>
                    </div>
                    <pre style={{ padding: 14, overflow: "auto", fontSize: "0.82rem", fontFamily: "var(--font-mono)", background: "rgba(0,0,0,0.35)", lineHeight: 1.6 }}>
                      <code>{codeBlocks[i].code}</code>
                    </pre>
                  </div>
                )}
              </span>
            ))}
          </div>
          <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-title">
          <span style={{ fontSize: "1.3rem", filter: "drop-shadow(0 0 8px var(--accent-glow))" }}>✨</span>
          <span>Byeol</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as GroqModel)}
            style={{
              padding: "5px 10px",
              background: "var(--glass)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--lunar)",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
            <option value="llama-3.1-8b-instant">Llama 3.1 8B</option>
            <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
          </select>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: "var(--lunar)", cursor: "pointer", padding: 4, borderRadius: 4 }}
            >
              <XIcon size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i}>{renderMessage(msg)}</div>
        ))}
        {isLoading && (
          <div className="message">
            <div className="message-avatar">
              <LoaderIcon size={16} />
            </div>
            <div className="thinking-indicator">
              <div className="thinking-dot" />
              <div className="thinking-dot" style={{ animationDelay: "-0.16s" }} />
              <div className="thinking-dot" style={{ animationDelay: "-0.32s" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {showUploader && (
        <div style={{ padding: "0 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ padding: "12px 0" }}>
            <FileUploader
              onFilesSelected={(files) => setAttachments((prev) => [...prev, ...files])}
              attachments={attachments}
              onRemove={(i) => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
            />
          </div>
        </div>
      )}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <button
            className="input-icon-btn"
            onClick={() => setShowUploader(!showUploader)}
            style={{ color: showUploader ? "var(--accent)" : undefined }}
          >
            <PaperclipIcon size={18} />
          </button>
          <VoiceButton onTranscript={handleVoice} />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Byeol anything..."
            rows={1}
          />
          <button className="send-btn" onClick={handleSend} disabled={isLoading}>
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
