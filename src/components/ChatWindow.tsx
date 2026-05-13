"use client";
import { useState, useRef, useEffect } from "react";
import { generatePDF } from "@/utils/generatePDF";
import { generateDOCX } from "@/utils/generateDOCX";

interface Message {
  role: "user" | "assistant";
  content: string;
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
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message (including potential file text)
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    const userMsg: Message = { role: "user", content };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) throw new Error("API error");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]" || data === "[TRUNCATED]") continue;
            try {
              const text = JSON.parse(data);
              assistantContent += text;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantContent };
                return copy;
              });
              // Real‑time code and artifact extraction
              extractLiveContent(assistantContent);
            } catch (e) {
              // ignore malformed chunks
            }
          }
        }
      }
      // After full response, do a final extraction
      extractLiveContent(assistantContent);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having a moment, Dal. Could you try again? 💛" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractLiveContent = (content: string) => {
    // 1. Extract code blocks for the editor (```html, ```css, ```javascript)
    const codeBlockRegex = /```(html|css|javascript|js)([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const code = match[2].trim();
      onCodeUpdate(code);
    }

    // 2. Extract artifact blocks
    const artifactRegex = /```artifact\n([\s\S]*?)```/g;
    while ((match = artifactRegex.exec(content)) !== null) {
      try {
        const artifact = JSON.parse(match[1].trim());
        handleArtifact(artifact);
      } catch (err) {
        console.warn("Invalid artifact JSON", match[1]);
      }
    }
  };

  const handleArtifact = (artifact: any) => {
    if (artifact.type === "html") {
      // Render in preview panel
      onCodeUpdate(artifact.content);
    } else if (artifact.type === "pdf") {
      generatePDF(artifact.content, artifact.title || "Byeol_Study_Artifact");
    } else if (artifact.type === "docx") {
      generateDOCX(artifact.content, artifact.title || "Byeol_Study_Artifact");
    }
  };

  // Handle file upload
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
        setMessages((prev) => [...prev, { role: "assistant", content: `File error: ${error}` }]);
        return;
      }
      // Prepend file context and ask for summary
      const fileMessage = `I've uploaded a file: "${file.name}". Please summarize it, generate 5 practice questions, and create an interactive study artifact if helpful.\n\n---\n${text}\n---`;
      await sendMessage(fileMessage);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white text-[var(--text)]"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="mt-4 flex gap-2 items-center">
        {/* File upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full bg-[var(--surface)] border border-[var(--border)]"
          title="Upload a file"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleFileUpload}
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Ask Byeol anything about code or your studies..."
          className="flex-1 p-3 rounded-xl border focus:outline-none"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
        />
        <button
          onClick={() => sendMessage(input)}
          className="px-4 py-2 rounded-xl text-white font-semibold"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
