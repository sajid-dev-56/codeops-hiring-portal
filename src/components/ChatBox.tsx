"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  sender: "ADMIN" | "CANDIDATE";
  createdAt: string;
}

interface ChatBoxProps {
  candidateId: string;
  currentRole: "ADMIN" | "CANDIDATE";
}

export function ChatBox({ candidateId, currentRole }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [candidateId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?candidateId=${candidateId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, content: newMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse flex space-x-4 p-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-surface-200 rounded w-3/4"></div></div></div>;
  }

  return (
    <div className="flex flex-col h-[500px] bg-white border border-surface-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50">
        <h3 className="text-lg font-medium text-surface-900">Messages</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-surface-500 h-full flex items-center justify-center">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === currentRole;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-xs font-medium text-surface-500">
                    {msg.sender === "ADMIN" ? "Admin Team" : "Candidate"}
                  </span>
                  <span className="text-xs text-surface-400">
                    {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-[80%] ${
                    isMe
                      ? "bg-primary-600 text-white rounded-br-sm shadow-md shadow-primary-500/20"
                      : "bg-surface-100 text-surface-900 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-surface-200">
        <form onSubmit={sendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 block w-full rounded-xl border-surface-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-surface-50 px-4 py-3"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="inline-flex items-center justify-center p-3 border border-transparent rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
