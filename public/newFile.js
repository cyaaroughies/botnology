(() => {
  function $(id) {
    return document.getElementById(id);
  }

  async function health() {
    try {
      const r = await fetch("/api/health");
      const j = await r.json();
      const line = $("healthLine");
      if (line) line.textContent = `API: ${j.status} | OpenAI: ${j.openai ? "ON" : "OFF"} | Stripe: ${j.stripe ? "ON" : "OFF"}`;
    } catch {
      const line = $("healthLine");
      if (line) line.textContent = "API: OFFLINE";
    }
  }

  function addMsg(role, text) {
    const box = $("messages");
    if (!box) return;
    const d = document.createElement("div");
    d.className = "msg " + (role === "user" ? "user" : "assistant");
    d.textContent = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }

  async function send() {
    const input = $("chatInput");
    if (!input) return;
    const msg = (input.value || "").trim();
    if (!msg) return;
    input.value = "";
    addMsg("user", msg);
    addMsg("assistant", "Thinking...");

    const box = $("messages");
    const last = box ? box.lastElementChild : null;

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      const j = await r.json();
      if (last) last.textContent = j.reply || "(no reply)";
    } catch (e) {
      if (last) last.textContent = "Chat failed.";
    }
  }

  function wire() {
    $("goHome") && ($("goHome").onclick = () => location.href = "/");
    $("goPricing") && ($("goPricing").onclick = () => location.href = "/pricing.html");
    $("goDash") && ($("goDash").onclick = () => location.href = "/dashboard.html");
    $("sendBtn") && ($("sendBtn").onclick = () => send());
    $("chatInput") && ($("chatInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    }));
  }

  wire();
  health();
})();
