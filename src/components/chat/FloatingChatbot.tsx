"use client";

import { useState, useRef, useEffect } from "react";
import { Cat, X, Send, Loader2 } from "lucide-react";

import { usePathname } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function FloatingChatbot() {
  const pathname = usePathname();
  const role = pathname?.startsWith("/admin") ? "ADMIN" : "CANDIDATE";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm JIYA. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          role,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I am having trouble connecting right now." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Bubble Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center"
        >
          <Cat size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Cat size={24} />
              <div>
                <h3 className="font-bold text-lg leading-none">JIYA</h3>
                <span className="text-indigo-200 text-xs">{role === "ADMIN" ? "HR Assistant" : "Candidate Assistant"}</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-indigo-100 hover:text-white transition-colors p-1 rounded-full hover:bg-indigo-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
