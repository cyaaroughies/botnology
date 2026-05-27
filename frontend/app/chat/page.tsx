
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TutorPage() 
export default function ChatPage() 

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
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b p-4 text-xl font-semibold">
        Chat with Dr. Botonic
      </header>

      {/* Chat Window */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl max-w-xl ${
                msg.role === "assistant"
                  ? "bg-card border"
                  : "bg-primary text-primary-foreground ml-auto"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-3">
          <Textarea
            placeholder="Ask Dr. Botonic anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button onClick={sendMessage} className="h-auto px-6">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
