// Botnology101 Dashboard Script

// ========== Utility ==========
function $(id) { return document.getElementById(id); }
function q(sel) { return document.querySelector(sel); }
function qa(sel) { return Array.from(document.querySelectorAll(sel)); }
function escapeHTML(str) { return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function show(el) { el && (el.style.display = ""); }
function hide(el) { el && (el.style.display = "none"); }
function setText(id, txt) { const el=$(id); if(el) el.textContent=txt; }
function badgeClass(plan) {
  plan = (plan||"").toLowerCase();
  if (plan==="masters") return "badge gold";
  if (plan==="bachelors") return "badge";
  return "badge";
}

// ========== State ==========
let user = { name: "Guest", plan: "associates", student_id: "BN-…", token: null };
let announcements = [];
let chatHistory = [];
let subscription = { status: "none" };

// ========== Auth Modal ==========
function openAuthModal() {
  // Implement modal open logic if needed
}
function closeAuthModal() {
  // Implement modal close logic if needed
}
if ($("openAuth")) $("openAuth").onclick = openAuthModal;

// ========== API Health ==========
async function checkHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    setText("healthLine", "API: " + (data.status === "ok" ? "online" : "offline"));
    $("healthDot").style.background = data.status === "ok" ? "#10b981" : "#f43f5e";
  } catch {
    setText("healthLine", "API: offline");
    $("healthDot").style.background = "#f43f5e";
  }
}
checkHealth();

// ========== Whoami & Plan ==========
async function fetchMe() {
  try {
    const res = await fetch("/api/me", { headers: user.token ? { Authorization: "Bearer " + user.token } : {} });
    const data = await res.json();
    if (data.logged_in) {
      user = { ...user, ...data };
      setText("whoami", `${user.name} • ${user.student_id}`);
      setText("planBadge", (user.plan||"ASSOCIATES").toUpperCase());
      $("planBadge").className = badgeClass(user.plan);
      setText("badgeName", user.name);
      setText("badgeId", user.student_id);
      setText("badgePlan", (user.plan||"ASSOCIATES").toUpperCase());
    }
  } catch {}
}
fetchMe();

// ========== Subscription ==========
async function fetchSubscription() {
  try {
    const res = await fetch("/api/subscription", { headers: user.token ? { Authorization: "Bearer " + user.token } : {} });
    const data = await res.json();
    subscription = data;
    setText("subBadge", "SUBSCRIPTION: " + (data.status||"NONE").toUpperCase());
  } catch {}
}
fetchSubscription();

// ========== Announcements ==========
async function fetchAnnouncements() {
  try {
    const res = await fetch("/api/announcements");
    const data = await res.json();
    announcements = data.items || [];
    renderAnnouncements();
  } catch {}
}
function renderAnnouncements() {
  const list = $("announcementsList");
  if (!list) return;
  list.innerHTML = announcements.map(a =>
    `<div class="message">${escapeHTML(a.text)}${a.date ? `<span class="smallmuted" style="margin-left:8px">${escapeHTML(a.date)}</span>` : ""}</div>`
  ).join("");
}
if ($("announceAdd")) {
  $("announceAdd").onclick = async () => {
    const txt = $("announceText").value.trim();
    if (!txt) return;
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(user.token ? { Authorization: "Bearer " + user.token } : {}) },
        body: JSON.stringify({ text: txt })
      });
      if (res.ok) {
        $("announceText").value = "";
        fetchAnnouncements();
      }
    } catch {}
  };
}
fetchAnnouncements();

// ========== Chat ==========
if ($("sendBtn")) {
  $("sendBtn").onclick = async () => {
    const msg = $("chatInput").value.trim();
    if (!msg) return;
    $("chatInput").value = "";
    chatHistory.push({ role: "user", content: msg });
    renderChat();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(user.token ? { Authorization: "Bearer " + user.token } : {}) },
        body: JSON.stringify({ message: msg, history: chatHistory.slice(-10), plan: user.plan })
      });
      const data = await res.json();
      chatHistory.push({ role: "assistant", content: data.reply });
      renderChat();
      if ($("speakToggle") && $("speakToggle").checked) speak(data.reply);
    } catch (e) {
      chatHistory.push({ role: "assistant", content: "(Error: could not reach API)" });
      renderChat();
    }
  };
}
function renderChat() {
  const msgs = $("messages");
  if (!msgs) return;
  msgs.innerHTML = chatHistory.map(m =>
    `<div class="message ${m.role}">${escapeHTML(m.content)}</div>`
  ).join("");
  msgs.scrollTop = msgs.scrollHeight;
}

// ========== TTS ==========
function speak(text) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = speechSynthesis.getVoices().find(v => v.name.toLowerCase().includes(($("voiceSelect")?.value||"alloy").toLowerCase())) || null;
  speechSynthesis.speak(utter);
}

// ========== Badge Photo ==========
if ($("openBadge")) $("openBadge").onclick = () => $("badgeModal").style.display = "";
if ($("closeBadge")) $("closeBadge").onclick = () => $("badgeModal").style.display = "none";
if ($("badgeFile")) $("badgeFile").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => $("cropImg").src = ev.target.result;
  reader.readAsDataURL(file);
};
if ($("saveBadgePhoto")) $("saveBadgePhoto").onclick = async () => {
  const img = $("cropImg").src;
  if (!img.startsWith("data:")) return;
  try {
    await fetch("/api/photo", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(user.token ? { Authorization: "Bearer " + user.token } : {}) },
      body: JSON.stringify({ photo_base64: img.split(",")[1] })
    });
    $("badgePhoto").src = img;
    $("badgeModal").style.display = "none";
  } catch {}
};

// ========== Quiz ==========
if ($("quizGenerate")) $("quizGenerate").onclick = async () => {
  const topic = $("quizTopic").value.trim();
  const level = $("quizLevel").value;
  try {
    const res = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(user.token ? { Authorization: "Bearer " + user.token } : {}) },
      body: JSON.stringify({ topic, level })
    });
    const data = await res.json();
    renderQuiz(data.questions || []);
  } catch {}
};
function renderQuiz(questions) {
  const list = $("quizList");
  if (!list) return;
  list.innerHTML = (questions||[]).map((q,i) =>
    `<tr><td>${escapeHTML(q.q||"")}</td><td><input data-qi="${i}" class="input" placeholder="Your answer"/></td></tr>`
  ).join("");
  $("quizScore").textContent = `Score: 0 / ${questions.length}`;
}
if ($("quizGrade")) $("quizGrade").onclick = () => {
  const rows = qa("#quizList input");
  const answers = rows.map(r => r.value.trim());
  // For demo, just count non-empty
  const score = answers.filter(a => a).length;
  $("quizScore").textContent = `Score: ${score} / ${rows.length}`;
};

// ========== File Storage ==========
if ($("fsRefresh")) $("fsRefresh").onclick = async () => {
  try {
    const res = await fetch("/api/storage/list", { headers: user.token ? { Authorization: "Bearer " + user.token } : {} });
    const data = await res.json();
    $("fsTree").textContent = JSON.stringify(data.tree, null, 2);
  } catch {}
};

// ========== Theme Toggle ==========
if ($("themeToggle")) $("themeToggle").onclick = () => {
  document.body.classList.toggle("yeti");
};
