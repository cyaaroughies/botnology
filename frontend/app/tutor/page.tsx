"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  sender: "ai" | "user";
  text: string;
};

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: "Hello, I’m Dr. Botnotic. What topic are you studying today?" },
  ]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      setMessages([
        ...newMessages,
        {
          sender: "ai",
          text: data.reply ?? "Dr. Botnotic is unavailable right now.",
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          sender: "ai",
          text: "Dr. Botnotic could not reach the reply service.",
        },
      ]);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[radial-gradient(1000px_700px_at_20%_10%,rgba(191,230,208,.12),transparent_55%),radial-gradient(900px_600px_at_80%_0%,rgba(214,182,107,.12),transparent_60%),linear-gradient(180deg,#07140e_0%,#0b1a12_45%,#07140e_100%)] text-[#f8f3e7]">
      <header className="border-b border-[rgba(214,182,107,.18)] bg-[rgba(8,20,14,.82)] p-4 shadow-[0_20px_60px_rgba(0,0,0,.28)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 lg:px-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#d6b667]">Botnology101</div>
            <h1 className="mt-1 text-2xl font-semibold">AI Tutor</h1>
          </div>
          <span className="text-sm text-[#b8c6c0]">Dr. Botnotic</span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <section className="rounded-[24px] border border-[rgba(214,182,107,.18)] bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,.24)] lg:p-8">
          <div className="flex items-center gap-3">
            <img
              src="/dr-botonic.jpeg"
              alt="Dr. Botnotic"
              className="h-12 w-12 rounded-full border border-[rgba(214,182,107,.32)] object-cover"
            />
            <div>
              <div className="text-sm font-bold tracking-[0.04em]">Botnology101</div>
              <p className="text-sm text-[#b8c6c0]">Ask a question and Dr. Botnotic will answer from the reply service.</p>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Link href="/courses" className="rounded-full bg-[linear-gradient(135deg,#d6b667,#b99644)] px-4 py-2 text-sm font-bold text-[#08120d] transition hover:brightness-105">
              Courses
            </Link>
            <Link href="/study-hall" className="rounded-full border border-[rgba(214,182,107,.18)] bg-white/5 px-4 py-2 text-sm font-bold text-[#f8f3e7] transition hover:bg-white/10">
              Study Hall
            </Link>
          </div>
        </section>

        <section className="flex-1 overflow-y-auto rounded-[24px] border border-[rgba(214,182,107,.18)] bg-[rgba(8,20,14,.76)] p-4 space-y-4 shadow-[0_14px_34px_rgba(0,0,0,.16)]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-7 ${
                msg.sender === "user"
                  ? "ml-auto bg-[linear-gradient(135deg,#d6b667,#b99644)] text-[#08120d]"
                  : "border border-[rgba(214,182,107,.12)] bg-white/5 text-[#f8f3e7]"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </section>

        <div className="rounded-[24px] border border-[rgba(214,182,107,.18)] bg-[rgba(8,20,14,.82)] p-4 shadow-[0_20px_60px_rgba(0,0,0,.28)] backdrop-blur-md">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ask Dr. Botnotic anything..."
              className="flex-1 rounded-2xl border border-[rgba(214,182,107,.16)] bg-[rgba(5,13,9,.72)] px-4 py-3 text-[#f8f3e7] outline-none placeholder:text-[#8f9f98]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <Button onClick={sendMessage} className="h-auto rounded-2xl bg-[linear-gradient(135deg,#d6b667,#b99644)] px-6 text-[#08120d] hover:brightness-105">
              Send
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
