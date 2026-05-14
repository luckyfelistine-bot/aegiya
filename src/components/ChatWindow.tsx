"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GROQ_MODELS } from "@/lib/groq";
import { memory } from "@/lib/memory";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import {
  SendIcon,
  XIcon,
  PaperclipIcon,
  SparklesIcon,
  CodeIcon,
  FileIcon,
  CheckIcon,
} from "@/components/SvgIcons";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

interface Attachment {
  name: string;
  type: string;
  content: string;
}

interface ToolCall {
  id: string;
  name: string;
  params: any;
  status: "pending" | "running" | "completed" | "error";
  result?: any;
}

interface ChatWindowProps {
  onClose: () => void;
  onToolCall?: (tool: string, params: any) => Promise<any>;
}

export function ChatWindow({ onClose, onToolCall }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<string>(GROQ_MODELS.DEFAULT);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await memory.getMessages(50);
        if (saved.length > 0) {
          setMessages(saved);
        } else {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: "Hey Dal! I'm Byeol, your companion in this universe. I can code with you, plan our future, or just chat. What would you like to do?",
              timestamp: Date.now(),
            },
          ]);
        }
      } catch (e) {
        console.error("Failed to load messages:", e);
      }
    };
    load();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [input]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const sendMessage = async (text: string, fileAttachments: Attachment[] = []) => {
    if ((!text.trim() && fileAttachments.length === 0) || isLoading) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
      attachments: fileAttachments.length ? fileAttachments : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    await memory.saveMessage(userMsg);

    const apiMessages = [...messages, userMsg].slice(-20).map(m => ({
      role: m.role,
      content: m.content + (m.attachments ? `\n\n[Attachments: ${m.attachments.map(a => a.name).join(", ")}]` : ""),
    }));

    const finalMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...apiMessages,
    ];

    const assistantId = generateId();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: finalMessages, model }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.content || "";
              if (content) {
                fullContent += content;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantId
                      ? { ...msg, content: fullContent, isStreaming: true }
                      : msg
                  )
                );
              }
            } catch {
              // ignore malformed JSON
            }
          }
        }
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: fullContent, isStreaming: false }
            : msg
        )
      );

      await memory.saveMessage({
        id: assistantId,
        role: "assistant",
        content: fullContent,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: "I hit a cosmic disturbance. Let me try again — what were we working on?", isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, attachments);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setAttachments(prev => [...prev, { name: file.name, type: file.type, content }]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const applyCodeToEditor = (code: string) => {
    window.dispatchEvent(new CustomEvent("byeol:setCode", { detail: { code } }));
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-title">
          <SparklesIcon size={20} />
          <span>Byeol</span>
        </div>
        <div className="chat-actions">
          <div className="model-picker">
            <button className="model-btn" onClick={() => setShowModelPicker(!showModelPicker)}>
              {model === GROQ_MODELS.DEFAULT ? "Llama 3.3" : "Llama 3.1 Fast"}
            </button>
            {showModelPicker && (
              <div className="model-dropdown glass-strong">
                <button
                  className={model === GROQ_MODELS.DEFAULT ? "active" : ""}
                  onClick={() => { setModel(GROQ_MODELS.DEFAULT); setShowModelPicker(false); }}
                >
                  Llama 3.3 70B (Powerful)
                </button>
                <button
                  className={model === GROQ_MODELS.FAST ? "active" : ""}
                  onClick={() => { setModel(GROQ_MODELS.FAST); setShowModelPicker(false); }}
                >
                  Llama 3.1 8B (Fast)
                </button>
              </div>
            )}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close chat">
            <XIcon size={18} />
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`message ${msg.role}`}
          >
            <div className="message-avatar">
              {msg.role === "assistant" ? "✨" : "👤"}
            </div>
            <div className="message-content">
              <div className="message-text">
                {msg.role === "assistant" ? (
                  <FormattedMessage content={msg.content} onApplyCode={applyCodeToEditor} />
                ) : (
                  msg.content
                )}
              </div>
              {msg.attachments && (
                <div className="message-attachments">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="attachment-badge">
                      <FileIcon size={12} />
                      <span>{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">✨</div>
            <div className="message-content">
              <div className="thinking-indicator">
                <div className="thinking-dot" />
                <div className="thinking-dot" />
                <div className="thinking-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        {attachments.length > 0 && (
          <div className="attachment-list">
            {attachments.map((att, i) => (
              <div key={i} className="attachment-chip">
                <FileIcon size={12} />
                <span>{att.name}</span>
                <button onClick={() => removeAttachment(i)}>
                  <XIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="chat-input-row">
          <button className="input-icon-btn" onClick={() => fileInputRef.current?.click()} title="Attach file">
            <PaperclipIcon size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".txt,.html,.css,.js,.pdf,.docx"
            onChange={handleFileSelect}
          />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Byeol anything..."
            rows={1}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage(input, attachments)}
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
          >
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FormattedMessage({ content, onApplyCode }: { content: string; onApplyCode: (code: string) => void }) {
  const parts = content.split(/(\`\`\`[\w]*\n[\s\S]*?\n\`\`\`|\`[^\`]+\`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const lang = part.match(/```(\w+)/)?.[1] || "";
          const code = part.replace(/```[\w]*\n?/, "").replace(/\n?```$/, "");
          return (
            <div key={i} className="code-block">
              <div className="code-block-header">
                <span>{lang || "code"}</span>
                <button onClick={() => onApplyCode(code)}>
                  <CodeIcon size={14} /> Apply to Editor
                </button>
              </div>
              <pre><code>{code}</code></pre>
            </div>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default ChatWindow;

