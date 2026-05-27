"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello, I’m Dr. Botonic. How can I help you study today?" }
  ]);

  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();

    setMessages([
      ...newMessages,
      { role: "assistant", content: data.reply },
    ]);
  }

  return (
    <main className="flex flex-col h-screen bg-gray-100 text-gray-900">

      {/* Header */}
      <header className="border-b p-4 text-xl font-semibold bg-white">
        Chat with Dr. Botonic
      </header>

      {/* Chat Window */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl max-w-xl ${
              msg.role === "assistant"
                ? "bg-white border shadow"
                : "bg-blue-600 text-white ml-auto"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ask Dr. Botonic anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border rounded-lg px-4 py-2"
          />

          <Button onClick={sendMessage} className="h-auto px-6">
            Send
          </Button>
        </div>
      </div>

    </main>
  );
}
