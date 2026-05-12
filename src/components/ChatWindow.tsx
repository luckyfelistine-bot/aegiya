"use client";
import { useState, useRef, useEffect } from "react";

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
    { role: "assistant", content: "Hi Dal! I'm Byeol, your personal star. ✨ How can I help you with coding or studies today?" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
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

      // Add a placeholder assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]" || data === "[TRUNCATED]") continue;
            assistantContent += JSON.parse(data);
            // Update last message
            setMessages(prev => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: assistantContent };
              return copy;
            });

            // Check for code blocks (```html ... ```) and extract
            if (assistantContent.includes("```")) {
              const codeMatches = assistantContent.matchAll(/```(?:\w+)?\n?([\s\S]*?)```/g);
              for (const match of codeMatches) {
                const code = match[1].trim();
                onCodeUpdate(code);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having a moment, Dal. Could you try again? 💛" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractCodeFromString = (content: string): string | null => {
    const match = content.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
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
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Byeol anything about code or your studies..."
          className="flex-1 p-3 rounded-xl border focus:outline-none"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-xl text-white font-semibold"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
