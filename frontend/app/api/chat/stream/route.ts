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

function getChatStreamTargetCandidates() {
  const configuredBase = (
    process.env.BOTNOLOGY_CHAT_ENDPOINT ||
    process.env.BOTNOLOGY_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BOTNOLOGY_API_BASE_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");

  const configuredTarget = configuredBase
    ? configuredBase.endsWith("/api/chat/stream") || configuredBase.endsWith("/chat/stream")
      ? configuredBase
      : configuredBase.endsWith("/api/chat") || configuredBase.endsWith("/chat")
        ? `${configuredBase}/stream`
        : `${configuredBase}/api/chat/stream`
    : "";

  const candidates = [
    configuredTarget,
    "http://127.0.0.1:3050/api/chat/stream",
    "http://127.0.0.1:8000/api/chat/stream",
    "http://127.0.0.1:8000/chat/stream",
  ];

  return candidates.filter((candidate, index) => candidate && candidates.indexOf(candidate) === index);
}

function sseResponseFromText(text: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`));
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
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
      return sseResponseFromText("Missing message.");
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
    for (const target of getChatStreamTargetCandidates()) {
      try {
        const response = await fetch(target, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          throw new Error(errorBody || `HTTP ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/event-stream") && response.body) {
          return new Response(response.body, {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          });
        }

        const data = await response.json().catch(() => ({}));
        const reply = String(data?.reply || data?.message || "").trim();
        return sseResponseFromText(reply || "Dr. Botnotic is ready when you are.");
      } catch (error) {
        lastError = error;
      }
    }

    console.error("Chat stream proxy targets failed:", lastError);
    return sseResponseFromText(
      "Dr. Botnotic is warming up. Backend tutoring service is temporarily unavailable, but I can still help you work through one step at a time."
    );
  } catch (error) {
    console.error("Chat stream API error:", error);
    return sseResponseFromText("Dr. Botnotic hit a temporary issue. Please try your question again.");
  }
}
