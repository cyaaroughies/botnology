"use client";

import { useState } from "react";

export default function TutorPage() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello, I’m Dr. Botonic. What topic are you studying today?" }
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);

    // Clear input
    setInput("");

    // Placeholder AI response (replace with backend later)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "Great question! Let me walk you through it step by step."
        }
      ]);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">

      {/* Header */}
      <header className="p-6 bg-white shadow flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Tutor</h1>
        <span className="text-gray-600">Dr. Botonic</span>
      </header>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xl p-4 rounded-xl ${
              msg.sender === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-white text-gray-900 shadow"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white shadow flex gap-4">
        <input
          type="text"
          placeholder="Ask Dr. Botonic anything..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Send
        </button>
      </div>

    </main>
  );
}
