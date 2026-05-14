"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { groq, GROQ_MODELS } from "@/lib/groq";
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
  const [model, setModel] = useState(GROQ_MODELS.DEFAULT);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load messages
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await memory.getMessages(50);
        if (saved.length > 0) {
          setMessages(saved);
        } else {
          // Welcome message
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content:
                "Hey Dal! I'm Byeol, your companion in this universe. I can code with you, plan our future, or just chat. What would you like to do?",
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
      el.style.height = el.scrollHeight + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      const contextMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...newMessages.slice(-20).map((m) => ({
          role: m.role,
          content:
            m.content +
            (m.attachments
              ? "\n\n[Attachments: " +
                m.attachments.map((a) => a.name).join(", ") +
                "]"
              : ""),
        })),
      ];

      // Get current editor code if available
      let editorContext = "";
      try {
        const code = await new Promise<string>((resolve) => {
          const handler = (e: any) => {
            window.removeEventListener("byeol:editorCode", handler);
            resolve(e.detail.code);
          };
          window.addEventListener("byeol:editorCode", handler);
          window.dispatchEvent(new CustomEvent("byeol:getCode"));
          setTimeout(() => resolve(""), 100);
        });
        if (code) editorContext = `\n\nCurrent editor content:\n\`\`\`${code.substring(
          0,
          2000
        )}\`\`\``;
      } catch (e) {
        // No editor open
      }

      const response = await groq.chat.completions.create({
        model,
        messages: [
          ...contextMessages,
          ...(editorContext
            ? [{ role: "system", content: editorContext }]
            : []),
        ],
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      });

      let assistantContent = "";
      let toolCalls: ToolCall[] = [];

      for await (const chunk of response) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          assistantContent += delta.content;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.id === "streaming") {
              return [
                ...prev.slice(0, -1),
                { ...last, content: assistantContent },
              ];
            }
            return [
              ...prev,
              {
                id: "streaming",
                role: "assistant",
                content: assistantContent,
                timestamp: Date.now(),
                toolCalls,
              },
            ];
          });
        }

        // Check for tool calls in content
        const toolRegex = /\[TOOL:(\w+)\](.*?)(?=\[TOOL:|\[\/TOOL\]|$)/gs;
        const matches = [...assistantContent.matchAll(toolRegex)];
        for (const match of matches) {
          const toolName = match[1];
          const toolParams = match[2].trim();
          if (
            !toolCalls.find(
              (t) => t.name === toolName && t.status === "pending"
            )
          ) {
            toolCalls.push({
              id: `tool-${Date.now()}-${toolName}`,
              name: toolName,
              params: toolParams,
              status: "pending",
            });
          }
        }
      }

      // Execute tool calls
      for (const toolCall of toolCalls) {
        if (onToolCall && toolCall.status === "pending") {
          toolCall.status = "running";
          try {
            const result = await onToolCall(toolCall.name, toolCall.params);
            toolCall.status = "completed";
            toolCall.result = result;
          } catch (e) {
            toolCall.status = "error";
            toolCall.result = { error: String(e) };
          }
        }
      }

      const finalMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantContent,
        timestamp: Date.now(),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== "streaming");
        return [...filtered, finalMsg];
      });

      await memory.saveMessage(userMsg);
      await memory.saveMessage(finalMsg);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "streaming"),
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "I hit a cosmic disturbance. Let me try again — what were we working on?",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const applyCodeToEditor = (code: string) => {
    window.dispatchEvent(new CustomEvent("byeol:setCode", { detail: { code } }));
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title">
          <SparklesIcon />
          <span>Byeol</span>
        </div>
        <div className="chat-actions">
          <div className="model-picker">
            <button
              className="model-btn"
              onClick={() => setShowModelPicker(!showModelPicker)}
            >
              {model === GROQ_MODELS.DEFAULT ? "Llama 3.1" : "Mixtral"}
            </button>
            {showModelPicker && (
              <div className="model-dropdown glass">
                <button
                  className={model === GROQ_MODELS.DEFAULT ? "active" : ""}
                  onClick={() => {
                    setModel(GROQ_MODELS.DEFAULT);
                    setShowModelPicker(false);
                  }}
                >
                  Llama 3.1 70B
                </button>
                <button
                  className={model === GROQ_MODELS.FAST ? "active" : ""}
                  onClick={() => {
                    setModel(GROQ_MODELS.FAST);
                    setShowModelPicker(false);
                  }}
                >
                  Mixtral 8x7B
                </button>
              </div>
            )}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close chat">
            <XIcon />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`message ${msg.role}`}
          >
            <div className="message-avatar">
              {msg.role === "assistant" ? "✨" : "👤"}
            </div>
            <div className="message-content">
              <div className="message-text">
                {msg.role === "assistant" ? (
                  <FormattedMessage
                    content={msg.content}
                    onApplyCode={applyCodeToEditor}
                  />
                ) : (
                  msg.content
                )}
              </div>
              {msg.attachments && (
                <div className="message-attachments">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="attachment-badge">
                      <FileIcon />
                      <span>{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {msg.toolCalls && (
                <div className="tool-calls">
                  {msg.toolCalls.map((tc) => (
                    <div key={tc.id} className={`tool-call ${tc.status}`}>
                      <CodeIcon />
                      <span>{tc.name}</span>
                      {tc.status === "completed" && <CheckIcon />}
                      {tc.status === "running" && <div className="tool-spinner" />}
                    </div>
                  ))}
                </div>
              )}
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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

      {/* Input */}
      <div className="chat-input-area">
        {attachments.length > 0 && (
          <div className="attachment-list">
            {attachments.map((att, i) => (
              <div key={i} className="attachment-chip">
                <FileIcon />
                <span>{att.name}</span>
                <button onClick={() => removeAttachment(i)}>
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="chat-input-row">
          {/* FileUploader and VoiceButton removed temporarily to fix build */}
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
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// Format assistant messages with code blocks and action buttons
function FormattedMessage({
  content,
  onApplyCode,
}: {
  content: string;
  onApplyCode: (code: string) => void;
}) {
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
                  <CodeIcon /> Apply to Editor
                </button>
              </div>
              <pre>
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="inline-code">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
