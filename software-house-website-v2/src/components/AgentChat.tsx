"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { askAgent } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! I'm iota, iotaDev's AI assistant. Ask me about our services, process, or how we can help your project.",
};

export default function AgentChat({ height = "400px" }: { height?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const reply = await askAgent(text, history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setError("Sorry, I couldn't reach the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gradient-border rounded-2xl overflow-hidden flex flex-col" style={{ background: "var(--bg-card)" }}>
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: "linear-gradient(135deg, #7C6CFF, #2DD4BF)", color: "#fff" }}
        >
          i
        </span>
        <div className="flex-1">
          <p className="font-semibold text-sm">iota Assistant</p>
          <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-success)" }} />
            Online — here to help
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ height, maxHeight: height }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user" ? "rounded-br-md" : "rounded-bl-md"
              }`}
              style={
                m.role === "user"
                  ? { background: "linear-gradient(135deg, #7C6CFF, #2DD4BF)", color: "#fff" }
                  : { background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }
              }
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#A79BFF" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#2DD4BF", animationDelay: "0.15s" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#FF8A5C", animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="px-5 pb-1 text-xs" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about services, process, pricing..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 disabled:opacity-60"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all duration-200 disabled:opacity-50 shrink-0"
          style={{ background: "linear-gradient(135deg, #7C6CFF, #2DD4BF)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
