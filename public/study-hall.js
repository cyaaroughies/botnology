// Botnology101 Study Hall Script

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
let chatHistory = [];
let quizData = { questions: [], answers: [], score: 0, total: 0 };
let flashcards = [];
let flashIndex = 0;
let flashFlipped = false;
let focusTimer = null;
let focusTimeLeft = 0;

// ========== Auth Modal ==========
if ($("openAuth")) $("openAuth").onclick = () => show($("authModal"));
if ($("closeAuth")) $("closeAuth").onclick = () => hide($("authModal"));
if ($("doAuth")) $("doAuth").onclick = async () => {
  const name = $("authName").value.trim() || "Student";
  const email = $("authEmail").value.trim();
  const plan = $("authPlan").value;
  if (!email || !email.includes("@")) {
    alert("Please enter a valid email.");
    return;
  }
  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, plan })
    });
    const data = await res.json();
    if (data.token) {
      user = { ...user, ...data, token: data.token };
      hide($("authModal"));
      fetchMe();
      showToast("Signed in!", `Welcome, ${user.name}`);
    } else {
      alert("Sign in failed.");
    }
  } catch {
    alert("Sign in failed.");
  }
};

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
    }
  } catch {}
}
fetchMe();

// ========== Theme Toggle ==========
if ($("themeToggle")) $("themeToggle").onclick = () => {
  document.body.classList.toggle("yeti");
};

// ========== Subject Select ==========
if ($("subjectSelect")) $("subjectSelect").onchange = () => {
  setText("subjectLabel", $("subjectSelect").value);
};

// ========== Focus Timer ==========
if ($("focusStart")) $("focusStart").onclick = () => {
  if (focusTimer) clearInterval(focusTimer);
  focusTimeLeft = 25 * 60;
  $("focusTimer").textContent = "25:00";
  $("focusTimer").classList.add("gold");
  focusTimer = setInterval(() => {
    if (focusTimeLeft <= 0) {
      clearInterval(focusTimer);
      $("focusTimer").textContent = "Done!";
      $("focusTimer").classList.remove("gold");
      showToast("Focus Complete", "Great job! Take a short break.");
      return;
    }
    focusTimeLeft--;
    const min = Math.floor(focusTimeLeft/60).toString().padStart(2,"0");
    const sec = (focusTimeLeft%60).toString().padStart(2,"0");
    $("focusTimer").textContent = `${min}:${sec}`;
  }, 1000);
};

// ========== Tab Navigation ==========
qa(".tab").forEach(btn => {
  btn.onclick = () => {
    qa(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    qa(".tab-content").forEach(tc => tc.style.display = "none");
    const tabId = "tab-" + btn.dataset.tab;
    if ($(tabId)) $(tabId).style.display = "";
  };
});

// ========== Chat ==========
if ($("sendBtn")) $("sendBtn").onclick = async () => {
  const msg = $("chatInput").value.trim();
  if (!msg) return;
  $("chatInput").value = "";
  chatHistory.push({ role: "user", content: msg });
  renderChat();
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(user.token ? { Authorization: "Bearer " + user.token } : {}) },
      body: JSON.stringify({ message: msg, history: chatHistory.slice(-10), subject: $("subjectSelect")?.value, plan: user.plan })
    });
    const data = await res.json();
    chatHistory.push({ role: "assistant", content: data.reply });
    renderChat();
  } catch {
    chatHistory.push({ role: "assistant", content: "(Error: could not reach API)" });
    renderChat();
  }
};
function renderChat() {
  const msgs = $("messages");
  if (!msgs) return;
  msgs.innerHTML = chatHistory.map(m =>
    `<div class="message ${m.role}">${escapeHTML(m.content)}</div>`
  ).join("");
  msgs.scrollTop = msgs.scrollHeight;
}

// ========== Quiz ==========
if ($("generateQuizBtn")) $("generateQuizBtn").onclick = async () => {
  const subject = $("quizSubject").value;
  const level = $("quizDifficulty").value.toLowerCase();
  const count = parseInt($("quizCount").value, 10) || 10;
  try {
    const res = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(user.token ? { Authorization: "Bearer " + user.token } : {}) },
      body: JSON.stringify({ topic: subject, level })
    });
    const data = await res.json();
    quizData.questions = (data.questions||[]).slice(0, count);
    quizData.answers = Array(quizData.questions.length).fill("");
    quizData.score = 0;
    quizData.total = quizData.questions.length;
    renderQuiz();
    show($("quizContent"));
    hide($("quizSetup"));
    hide($("quizResults"));
  } catch {
    alert("Failed to generate quiz.");
  }
};
function renderQuiz() {
  const qDiv = $("quizQuestions");
  if (!qDiv) return;
  qDiv.innerHTML = quizData.questions.map((q, i) =>
    `<div class="quiz-q">
      <div style="font-weight:600">${i+1}. ${escapeHTML(q.q||"")}</div>
      <input class="input" data-qi="${i}" placeholder="Your answer" value="${escapeHTML(quizData.answers[i]||"")}" style="margin-top:8px;width:100%"/>
    </div>`
  ).join("");
  qa("#quizQuestions input").forEach(inp => {
    inp.oninput = e => {
      const idx = parseInt(e.target.dataset.qi, 10);
      quizData.answers[idx] = e.target.value;
    };
  });
  setText("quizProgress", `0/${quizData.total}`);
}
if ($("submitQuizBtn")) $("submitQuizBtn").onclick = async () => {
  try {
    const res = await fetch("/api/quiz/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(user.token ? { Authorization: "Bearer " + user.token } : {}) },
      body: JSON.stringify({ questions: quizData.questions, answers: quizData.answers })
    });
    const data = await res.json();
    quizData.score = data.score;
    quizData.total = data.total;
    setText("resultScore", `${Math.round(100*data.score/(data.total||1))}%`);
    setText("resultText", data.score === data.total ? "Excellent work!" : "Keep practicing!");
    setText("resultEmoji", data.score === data.total ? "🎉" : "👍");
    show($("quizResults"));
    hide($("quizContent"));
    hide($("quizSetup"));
    // Optionally update stats
    updateStats();
  } catch {
    alert("Failed to grade quiz.");
  }
};
if ($("resetQuizBtn")) $("resetQuizBtn").onclick = () => {
  hide($("quizContent"));
  hide($("quizResults"));
  show($("quizSetup"));
};
if ($("reviewQuizBtn")) $("reviewQuizBtn").onclick = () => {
  const review = $("quizReview");
  if (!review) return;
  review.style.display = "";
  review.innerHTML = quizData.questions.map((q, i) =>
    `<div class="quiz-q">
      <div style="font-weight:600">${i+1}. ${escapeHTML(q.q||"")}</div>
      <div>Your answer: <span style="color:${quizData.answers[i]?.trim().toLowerCase() === (q.a||"").trim().toLowerCase() ? '#10b981':'#ef4444'}">${escapeHTML(quizData.answers[i]||"")}</span></div>
      <div>Correct: <span style="color:#10b981">${escapeHTML(q.a||"")}</span></div>
    </div>`
  ).join("");
};
if ($("newQuizBtn")) $("newQuizBtn").onclick = () => {
  hide($("quizResults"));
  hide($("quizContent"));
  show($("quizSetup"));
};

// ========== Flashcards ==========
if ($("generateFlashcardsBtn")) $("generateFlashcardsBtn").onclick = async () => {
  const topic = $("flashcardTopic").value.trim();
  const count = parseInt($("flashcardCount").value, 10) || 10;
  if (!topic) return alert("Enter a topic.");
  try {
    // For demo, use quiz API and treat Q/A as front/back
    const res = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(user.token ? { Authorization: "Bearer " + user.token } : {}) },
      body: JSON.stringify({ topic, level: "bachelors" })
    });
    const data = await res.json();
    flashcards = (data.questions||[]).slice(0, count);
    flashIndex = 0;
    flashFlipped = false;
    renderFlashcard();
    show($("flashcardDisplay"));
    hide($("flashcardSetup"));
  } catch {
    alert("Failed to generate flashcards.");
  }
};
function renderFlashcard() {
  const card = $("flashcard");
  const prog = $("flashcardProgress");
  if (!card || !prog) return;
  if (!flashcards.length) {
    card.textContent = "No cards.";
    prog.textContent = "0/0";
    return;
  }
  card.className = "flashcard" + (flashFlipped ? " flipped" : "");
  card.innerHTML = `<div id="flashcardContent">${escapeHTML(flashFlipped ? (flashcards[flashIndex].a||"") : (flashcards[flashIndex].q||""))}</div>`;
  prog.textContent = `${flashIndex+1}/${flashcards.length}`;
}
window.StudyHall = {
  flipCard: () => {
    flashFlipped = !flashFlipped;
    renderFlashcard();
  }
};
if ($("flipCardBtn")) $("flipCardBtn").onclick = () => {
  flashFlipped = !flashFlipped;
  renderFlashcard();
};
if ($("prevCardBtn")) $("prevCardBtn").onclick = () => {
  if (flashIndex > 0) { flashIndex--; flashFlipped = false; renderFlashcard(); }
};
if ($("nextCardBtn")) $("nextCardBtn").onclick = () => {
  if (flashIndex < flashcards.length-1) { flashIndex++; flashFlipped = false; renderFlashcard(); }
};
if ($("newDeckBtn")) $("newDeckBtn").onclick = () => {
  hide($("flashcardDisplay"));
  show($("flashcardSetup"));
};

// ========== Notes ==========
if ($("notesArea")) {
  let notesTimeout = null;
  $("notesArea").oninput = () => {
    if (notesTimeout) clearTimeout(notesTimeout);
    notesTimeout = setTimeout(saveNotes, 2000);
  };
  $("notesArea").value = localStorage.getItem("studyNotes") || "";
  function saveNotes() {
    localStorage.setItem("studyNotes", $("notesArea").value);
  }
}
if ($("notesExport")) $("notesExport").onclick = () => {
  const blob = new Blob([$("notesArea").value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "study-notes.txt";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
};
if ($("notesClear")) $("notesClear").onclick = () => {
  $("notesArea").value = "";
  localStorage.removeItem("studyNotes");
};
if ($("sessionExport")) $("sessionExport").onclick = () => {
  const data = {
    notes: $("notesArea").value,
    chat: chatHistory,
    quizzes: quizData
  };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "study-session.json";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
};

// ========== Stats & Chart ==========
function updateStats() {
  setText("totalMinutes", Math.floor((focusTimeLeft ? 25*60-focusTimeLeft : 0)/60));
  setText("totalQuizzes", quizData.total || 0);
  setText("avgScore", quizData.total ? Math.round(100*quizData.score/(quizData.total||1))+"%" : "0%");
  // Chart.js demo
  if (window.Chart && $("performanceChart")) {
    new Chart($("performanceChart").getContext("2d"), {
      type: "line",
      data: {
        labels: ["Quiz 1"],
        datasets: [{
          label: "Score (%)",
          data: [quizData.total ? Math.round(100*quizData.score/(quizData.total||1)) : 0],
          borderColor: "#facc15",
          backgroundColor: "rgba(250,204,21,.2)",
          tension: .3
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
}
updateStats();

// ========== Toast ==========
function showToast(title, msg) {
  // You can implement a toast UI if desired
  alert(`${title}\n${msg}`);
}
