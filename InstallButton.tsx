// src/components/ChatWindow.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SendIcon,
  PaperclipIcon,
  MicIcon,
  LoaderIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  SparklesIcon,
  UserIcon,
  ZapIcon,
  ChevronDownIcon,
} from "./SvgIcons";

/**
 * Chat message structure
 */
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  model?: string;
  attachments?: Attachment[];
}

/**
 * File attachment structure
 */
interface Attachment {
  name: string;
  type: string;
  content: string;
}

/**
 * Available AI models
 */
const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Powerful", description: "Deep reasoning & complex tasks" },
  { id: "llama-3.1-8b-instant", name: "Fast", description: "Quick responses & simple queries" },
];

/**
 * Props for ChatWindow
 */
interface ChatWindowProps {
  className?: string;
}

/**
 * Generate a unique message ID
 */
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Extract code blocks from markdown content
 */
const extractCodeBlocks = (content: string): { text: string; code: string; language: string }[] => {
  const regex = /```(\w+)?
([\s\S]*?)```/g;
  const blocks: { text: string; code: string; language: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        text: content.slice(lastIndex, match.index),
        code: "",
        language: "",
      });
    }
    blocks.push({
      text: "",
      code: match[2].trim(),
      language: match[1] || "text",
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    blocks.push({ text: content.slice(lastIndex), code: "", language: "" });
  }

  return blocks.length > 0 ? blocks : [{ text: content, code: "", language: "" }];
};

/**
 * ChatWindow - AI chat interface with streaming, file attachments, and code detection
 * Communicates with /api/chat endpoint
 */
export default function ChatWindow({ className = "" }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Load messages from IndexedDB on mount
   */
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { default: memory } = await import("@/lib/memory");
        const saved = await memory.getMessages();
        if (saved && saved.length > 0) {
          setMessages(saved);
        } else {
          // Welcome message
          setMessages([
            {
              id: generateId(),
              role: "assistant",
              content: "Hello Dal! I'm Byeol, your personal AI companion. I can help you code, explore the universe, or just chat. What would you like to do today?",
              timestamp: Date.now(),
              model: MODELS[0].id,
            },
          ]);
        }
      } catch {
        setMessages([
          {
            id: generateId(),
            role: "assistant",
            content: "Hello Dal! I'm Byeol, your personal AI companion. I can help you code, explore the universe, or just chat. What would you like to do today?",
            timestamp: Date.now(),
            model: MODELS[0].id,
          },
        ]);
      }
    };
    loadMessages();
  }, []);

  /**
   * Save messages to IndexedDB when they change
   */
  useEffect(() => {
    const saveMessages = async () => {
      if (messages.length === 0) return;
      try {
        const { default: memory } = await import("@/lib/memory");
        await memory.saveMessage(messages[messages.length - 1]);
      } catch {
        // Silently fail
      }
    };
    saveMessages();
  }, [messages]);

  /**
   * Auto-scroll to bottom when messages change
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handle file attachment
   */
  const handleFileAttach = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];

    for (const file of Array.from(files)) {
      const validTypes = [
        "text/plain",
        "text/html",
        "text/css",
        "text/javascript",
        "application/javascript",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type) && !file.name.endsWith(".js") && !file.name.endsWith(".css")) {
        continue;
      }

      try {
        const content = await file.text();
        newAttachments.push({
          name: file.name,
          type: file.type,
          content,
        });
      } catch {
        // Skip files that can't be read
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  /**
   * Remove an attachment
   */
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Send message to AI with streaming response
   */
  const sendMessage = useCallback(async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        model: selectedModel,
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: input.trim() },
          ],
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              fullContent += content;

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: fullContent } : m
                )
              );
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "I'm sorry, I encountered an error. Please try again.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, attachments, isLoading, messages, selectedModel]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  /**
   * Apply code block to editor via custom event
   */
  const applyCodeToEditor = useCallback((code: string) => {
    const event = new CustomEvent("byeol:setCode", { detail: code });
    window.dispatchEvent(event);
  }, []);

  /**
   * Copy code to clipboard
   */
  const copyCode = useCallback(async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Fallback
    }
  }, []);

  /**
   * Auto-resize textarea
   */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 glass-surface border-b border-glass-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aurora to-comet flex items-center justify-center">
            <SparklesIcon size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-sm text-starlight">Byeol</h2>
            <p className="text-[10px] text-starlight/50">AI Companion</p>
          </div>
        </div>

        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs"
          >
            <ZapIcon size={14} className="text-aurora" />
            <span className="text-starlight/80">
              {MODELS.find((m) => m.id === selectedModel)?.name}
            </span>
            <ChevronDownIcon size={12} className="text-starlight/50" />
          </button>

          {showModelSelector && (
            <div className="absolute top-full right-0 mt-2 glass-panel p-2 min-w-[200px] z-20">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedModel === model.id
                      ? "bg-white/10 text-aurora"
                      : "hover:bg-white/5 text-starlight/70"
                  }`}
                >
                  <div className="font-medium text-sm">{model.name}</div>
                  <div className="text-[10px] text-starlight/50">{model.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "user"
                  ? "bg-gradient-to-br from-comet to-aurora"
                  : "bg-gradient-to-br from-aurora to-solar"
              }`}
            >
              {message.role === "user" ? (
                <UserIcon size={16} className="text-white" />
              ) : (
                <SparklesIcon size={16} className="text-white" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={`max-w-[80%] ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`glass-surface px-4 py-3 ${
                  message.role === "user"
                    ? "bg-aurora/10 border-aurora/20"
                    : ""
                }`}
              >
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {message.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5 text-xs"
                      >
                        <PaperclipIcon size={12} />
                        <span className="text-starlight/70 truncate">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message text with code blocks */}
                {message.content ? (
                  <div className="space-y-3">
                    {extractCodeBlocks(message.content).map((block, i) => (
                      <div key={i}>
                        {block.text && (
                          <div className="text-sm text-starlight/90 leading-relaxed whitespace-pre-wrap">
                            {block.text}
                          </div>
                        )}
                        {block.code && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-glass-border">
                            <div className="flex items-center justify-between px-3 py-2 bg-eclipse border-b border-glass-border">
                              <span className="text-[10px] uppercase tracking-wider text-starlight/40">
                                {block.language}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => applyCodeToEditor(block.code)}
                                  className="px-2 py-1 rounded text-[10px] bg-aurora/20 text-aurora hover:bg-aurora/30 transition-colors"
                                >
                                  Apply to Editor
                                </button>
                                <button
                                  onClick={() => copyCode(block.code, `${message.id}-${i}`)}
                                  className="p-1 rounded hover:bg-white/10 transition-colors"
                                >
                                  {copiedCode === `${message.id}-${i}` ? (
                                    <CheckIcon size={12} className="text-success" />
                                  ) : (
                                    <CopyIcon size={12} />
                                  )}
                                </button>
                              </div>
                            </div>
                            <pre className="p-3 text-xs overflow-x-auto">
                              <code>{block.code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : message.role === "assistant" && isLoading ? (
                  <div className="flex items-center gap-2 text-starlight/50">
                    <LoaderIcon size={16} />
                    <span className="text-sm">Byeol is thinking...</span>
                  </div>
                ) : null}
              </div>

              <span className="text-[10px] text-starlight/30 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-aurora animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-aurora animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-aurora animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 glass-surface border-t border-glass-border">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs"
              >
                <PaperclipIcon size={12} />
                <span className="text-starlight/80">{att.name}</span>
                <button
                  onClick={() => removeAttachment(i)}
                  className="p-0.5 rounded hover:bg-white/20 transition-colors"
                >
                  <span className="text-starlight/50 text-xs">&times;</span>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.html,.css,.js,.pdf,.docx"
            onChange={handleFileAttach}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="glass-button p-3 flex-shrink-0"
            title="Attach files"
          >
            <PaperclipIcon size={18} />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Byeol..."
              className="glass-input resize-none py-3 pr-12"
              rows={1}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
            className="glass-button p-3 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-aurora/20 hover:border-aurora/50"
          >
            {isLoading ? <LoaderIcon size={18} /> : <SendIcon size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
