"use client";
import { useState, useRef, useEffect } from "react";
import { generateArtifact, generateSmartArtifact, ArtifactType } from "@/utils/generateArtifact";
import { speakText } from "@/utils/speech";
import VoiceButton from "@/components/VoiceButton";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  onCodeUpdate: (code: string, language?: string) => void;
  setIsLoading: (loading: boolean) => void;
}

const CODE_LANGUAGES = new Set([
  'html','css','javascript','js','typescript','ts','jsx','tsx','python','py',
  'json','xml','yaml','yml','sql','bash','sh','shell','powershell','ps1',
  'c','cpp','csharp','cs','java','go','rust','rs','swift','kotlin','kt',
  'ruby','rb','php','lua','r','matlab','scala','clojure','clj','haskell','hs',
  'erlang','erl','elixir','ex','fsharp','fs','vb','asm','perl','pl','groovy',
  'coffeescript','coffee','elm','nim','crystal','cr','vlang','v','dart',
  'vue','svelte','scss','sass','less','graphql','gql','prisma','dockerfile',
  'makefile','cmake','markdown','md','latex','tex','bib','csv','tsv','ini','env',
  'toml','log','diff','patch','http','regex','nginx','apache','apacheconf',
]);

export default function ChatWindow({ onCodeUpdate, setIsLoading }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi Dal! I'm Byeol, your personal star. ✨ How can I help you with coding or studies today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateMemory = async (assistantContent: string) => {
    const summary = assistantContent.slice(0, 300);
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

  const extractLiveContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const lang = (match[1] || '').toLowerCase().trim();
      const code = match[2].trim();
      if (CODE_LANGUAGES.has(lang)) {
        onCodeUpdate(code, lang);
      }
    }

    const artifactRegex = /```artifact\n([\s\S]*?)```/g;
    while ((match = artifactRegex.exec(content)) !== null) {
      try {
        const artifact = JSON.parse(match[1].trim());
        handleArtifact(artifact);
      } catch (err) {
        console.warn("Invalid artifact JSON", match[1]);
      }
    }

    const fileRegex = /\[FILE:\s*([^\]]+)\.([^\]]+)\]([\s\S]*?)\[\/FILE\]/g;
    while ((match = fileRegex.exec(content)) !== null) {
      const [, name, ext, fileContent] = match;
      const type = ext.toLowerCase() as ArtifactType;
      generateArtifact({
        type,
        content: fileContent.trim(),
        filename: name,
      }).catch(console.error);
    }
  };

  const handleArtifact = (artifact: any) => {
    if (!artifact.type) return;

    if (artifact.type === 'zip' && Array.isArray(artifact.files)) {
      generateArtifact({
        type: 'zip',
        content: '',
        title: artifact.title || 'Byeol_Bundle',
        files: artifact.files,
      }).catch(console.error);
      return;
    }

    const type = artifact.type as ArtifactType;
    generateArtifact({
      type,
      content: artifact.content || '',
      title: artifact.title || 'Byeol_Study_Artifact',
      filename: artifact.filename,
      options: artifact.options,
    }).catch(console.error);
  };

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
              extractLiveContent(assistantContent);
            } catch (e) {
              // ignore malformed chunks
            }
          }
        }
      }

      extractLiveContent(assistantContent);
      updateMemory(assistantContent);
      if (autoSpeak && assistantContent.length > 0) {
        speakText(assistantContent);
      }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/process-file", { method: "POST", body: formData });
      const { text, error, meta, wasTruncated } = await res.json();

      if (error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `File error: ${error}` }]);
        return;
      }

      const truncNote = wasTruncated ? '\n\n[Note: File was truncated due to size.]' : '';
      const metaNote = meta?.numpages ? `\n[PDF pages: ${meta.numpages}]` : '';
      const fileMessage = `I've uploaded a file: "${file.name}"${metaNote}${truncNote}. Please summarize it, generate 5 practice questions, and create an interactive study artifact if helpful.\n\n---\n${text}\n---`;

      await sendMessage(fileMessage);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Failed to upload file. Please try again." }]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
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
        <VoiceButton onTranscript={(text) => sendMessage(text)} />

        <button
          onClick={() => setAutoSpeak(!autoSpeak)}
          className={`p-2 rounded-full border transition ${
            autoSpeak ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)]"
          }`}
          title={autoSpeak ? "Mute voice" : "Unmute voice"}
        >
          {autoSpeak ? "🔊" : "🔇"}
        </button>

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
          accept=".pdf,.docx,.txt,.md,.html,.css,.js,.ts,.jsx,.tsx,.py,.json,.csv,.xml,.yaml,.yml,.sql,.sh,.c,.cpp,.java,.go,.rs,.rb,.php,.lua,.r,.swift,.kt,.dart,.cs,.scss,.sass,.less,.vue,.svelte,.ini,.env,.toml,.log,.tex,.xlsx,.xls"
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
