import { NextResponse } from "next/server";

type IncomingMessage = {
  role?: string;
  content?: string;
  sender?: string;
  text?: string;
};

function normalizeMessages(messages: unknown): Array<{ role: "user" | "assistant"; content: string }> {
  if (!Array.isArray(messages)) return [];

  return messages
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const item = message as IncomingMessage;
      const rawContent = typeof item.content === "string" ? item.content : typeof item.text === "string" ? item.text : "";
      if (!rawContent.trim()) return null;

      const role = item.role === "assistant" || item.sender === "ai" ? "assistant" : "user";
      return { role, content: rawContent };
    })
    .filter((message): message is { role: "user" | "assistant"; content: string } => Boolean(message));
}

function getChatTargetCandidates() {
  const configuredBase = (
    process.env.BOTNOLOGY_CHAT_ENDPOINT ||
    process.env.BOTNOLOGY_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BOTNOLOGY_API_BASE_URL ||
    ""
  ).trim().replace(/\/$/, "");

  const candidates = [
    configuredBase
      ? configuredBase.endsWith("/chat") || configuredBase.endsWith("/api/chat")
        ? configuredBase
        : `${configuredBase}/api/chat`
      : "",
    "http://127.0.0.1:3050/api/chat",
    "http://127.0.0.1:8000/api/chat",
    "http://127.0.0.1:8000/chat",
  ];

  return candidates.filter((candidate, index) => candidate && candidates.indexOf(candidate) === index);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = normalizeMessages(body.messages);
    const latestUserMessage =
      (typeof body.message === "string" ? body.message.trim() : "") ||
      [...messages].reverse().find((message) => message.role === "user")?.content ||
      messages.at(-1)?.content ||
      "";

    if (!latestUserMessage) {
      return NextResponse.json({ reply: "Missing message." }, { status: 400 });
    }

    const history = messages.slice(0, Math.max(messages.length - 1, 0));
    const payload = {
      message: latestUserMessage,
      messages,
      history,
      subject: typeof body.subject === "string" ? body.subject : "General",
      plan: typeof body.plan === "string" ? body.plan : "associates",
    };

    let lastError: unknown = null;
    for (const target of getChatTargetCandidates()) {
      try {
        const response = await fetch(target, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(typeof data?.detail === "string" ? data.detail : `HTTP ${response.status}`);
        }

        return NextResponse.json({ reply: data.reply ?? data.message ?? "" });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("Unable to contact Dr. Botnotic backend.");
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Error contacting Dr. Botnotic backend." },
      { status: 500 }
    );
  }
}
