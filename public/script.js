  const API = {
    health: "/api/health",
    chat: "/api/chat",
    auth: "/api/auth",
    me: "/api/me",
    history: "/api/history",
    subscription: "/api/subscription",
    photo: "/api/photo",
    checkout: "/api/stripe/create-checkout-session",
    storageList: "/api/storage/list",
    storageRead: "/api/storage/read",
    storageWrite: "/api/storage/write",
    storageDelete: "/api/storage/delete",
    tts: "/api/tts",
    quizGenerate: "/api/quiz/generate",
    quizGrade: "/api/quiz/grade",
    announcements: "/api/announcements"
  };

  // Capability flags for this repo (no music streaming here)
  const bnCapabilities = { music: false };

  // Block fetches to Spotify and Apple Music domains from this client
  (function installFetchGuard(){
    try {
      const BLOCK_HOSTS = [
        "spotify.com",
        "api.spotify.com",
        "music.apple.com",
        "itunes.apple.com",
        "audio.apple.com",
        "amp-api.music.apple.com"
      ];
      const originalFetch = window.fetch?.bind(window);
      if (!originalFetch) return;
      window.fetch = (input, init) => {
        try {
          const url = typeof input === "string" ? input : (input?.url || "");
          const u = new URL(url, location.origin);
          if (BLOCK_HOSTS.some(h => u.hostname.endsWith(h))) {
            return Promise.reject(new Error("Music streaming blocked in this app."));
          }
        } catch {}
        return originalFetch(input, init);
      };
    } catch {}
  })();

  function toast(title, msg) {
    const t = ((id) => document.getElementById(id))("toast");
    if (!t) return;
    ((id) => document.getElementById(id))("toastTitle").textContent = title;
    ((id) => document.getElementById(id))("toastMsg").textContent = msg;
    t.style.display = "block";
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.style.display = "none", 3800);
  }

  function uid() { return (Math.random().toString(16).slice(2) + Date.now().toString(16)).slice(0, 24); }

  function lsGet(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  }
  function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function getToken() { return localStorage.getItem("bn_token") || ""; }
  function setToken(t) { localStorage.setItem("bn_token", t || ""); }

  function getStudentId() {
    let id = localStorage.getItem("bn_student_id");
    if (!id) { id = "BN-" + uid().toUpperCase(); localStorage.setItem("bn_student_id", id); }
    return id;
  }

  function getPlan() { return (localStorage.getItem("bn_plan") || "associates").toLowerCase(); }
  function setPlan(p) { localStorage.setItem("bn_plan", (p || "associates").toLowerCase()); }

  function getSubject() { return (lsGet("bn_subject", "General") || "General"); }
  function setSubject(s) {
    lsSet("bn_subject", (s || "General"));
    const lab = ((id) => document.getElementById(id))("subjectLabel");
    if (lab) lab.textContent = getSubject();
    const sel = ((id) => document.getElementById(id))("subjectSelect");
    if (sel) sel.value = getSubject();
  }

  // Focus timer
  let _focusTimerId = null;
  function startFocus(minutes) {
    const totalMs = Math.max(1, (minutes || 25)) * 60 * 1000;
    const until = Date.now() + totalMs;
    lsSet("bn_focus_start", Date.now());
    lsSet("bn_focus_until", until);
    tickFocus();
    if (_focusTimerId) clearInterval(_focusTimerId);
    _focusTimerId = setInterval(tickFocus, 1000);
  }
  function tickFocus() {
    const until = lsGet("bn_focus_until", 0) || 0;
    const left = Math.max(0, until - Date.now());
    const el = ((id) => document.getElementById(id))("focusTimer");
    if (!el) return;
    if (!until || left <= 0) { el.textContent = "Idle"; if (_focusTimerId) { clearInterval(_focusTimerId); _focusTimerId = null; } return; }
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    el.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  async function apiGet(url) {
    const tok = getToken();
    const res = await fetch(url, { headers: tok ? { "Authorization": "Bearer " + tok } : {} });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "Request failed");
    return data;
  }

  async function apiPost(url, body) {
    const tok = getToken();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(tok ? { "Authorization": "Bearer " + tok } : {}) },
      body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "Request failed");
    return data;
  }

  function getSpeak() { return !!lsGet("bn_speak", false); }
  function setSpeak(v) { lsSet("bn_speak", !!v); const t = ((id) => document.getElementById(id))("speakToggle"); if (t) t.checked = !!v; }
  function getVoice() { return (localStorage.getItem("bn_voice") || "alloy"); }
  function setVoice(v) { try { localStorage.setItem("bn_voice", v); } catch {} const s = ((id) => document.getElementById(id))("voiceSelect"); if (s) s.value = v; }

  function openModal() { const m = ((id) => document.getElementById(id))("authModal"); if (m) m.style.display = "flex"; }
  function closeModal() { const m = ((id) => document.getElementById(id))("authModal"); if (m) m.style.display = "none"; }

  function openBadgeModal() { const m = ((id) => document.getElementById(id))("badgeModal"); if (m) m.style.display = "flex"; }
  function closeBadgeModal() { const m = ((id) => document.getElementById(id))("badgeModal"); if (m) m.style.display = "none"; }

  async function syncMe() {
    const badge = ((id) => document.getElementById(id))("planBadge");
    try {
      const me = await apiGet(API.me);
      if (me.logged_in) {
        setPlan(me.plan || getPlan());
        if (badge) badge.textContent = (me.plan || "associates").toUpperCase();
        const who = ((id) => document.getElementById(id))("whoami");
        if (who) who.textContent = `${me.name} • ${me.student_id}`;
        // Subscription badge
        try {
          const sub = await apiGet(API.subscription);
          const sb = ((id) => document.getElementById(id))("subBadge");
          if (sb) {
            const status = (sub.status || "none").toLowerCase();
            sb.textContent = `SUBSCRIPTION: ${status.toUpperCase()}`;
            sb.classList.remove("badge-active","badge-trialing","badge-none");
            if (status === "active") sb.classList.add("badge-active");
            else if (status === "trialing") sb.classList.add("badge-trialing");
            else sb.classList.add("badge-none");
          }
          const bp = ((id) => document.getElementById(id))("badgePlan"); if (bp && (sub.plan || me.plan)) bp.textContent = (sub.plan || me.plan || "associates").toUpperCase();
        } catch {}
        // Badge info
        const bn = ((id) => document.getElementById(id))("badgeName"); if (bn) bn.textContent = (me.name || "Student");
        const bi = ((id) => document.getElementById(id))("badgeId"); if (bi) bi.textContent = (me.student_id || getStudentId());
        await loadBadgePhoto();
        updatePlanGates(me.plan || getPlan());
        return me;
      }
    } catch { }
    if (badge) badge.textContent = getPlan().toUpperCase();
    const who = ((id) => document.getElementById(id))("whoami");
    if (who) who.textContent = `Guest • ${getStudentId()}`;
    updatePlanGates(getPlan());
    return null;
  }

  async function doAuth() {
    const email = (((id) => document.getElementById(id))("authEmail")?.value || "").trim();
    const name = (((id) => document.getElementById(id))("authName")?.value || "Student").trim();
    const plan = (((id) => document.getElementById(id))("authPlan")?.value || getPlan()).toLowerCase();
    if (!email || email.length < 5) return toast("Hold up", "Enter a real email.");
    const student_id = getStudentId();

    const out = await apiPost(API.auth, { email, name, student_id, plan });
    setToken(out.token);
    setPlan(out.plan);
    closeModal();
    toast("Welcome", `Signed in • Plan: ${(out.plan || plan).toUpperCase()}`);
    await syncMe();
  }

  function renderMsg(role, text) {
    const box = ((id) => document.getElementById(id))("messages");
    if (!box) return;
    const d = document.createElement("div");
    d.className = "msg " + (role === "user" ? "user" : "assistant");
    d.textContent = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }

  function getHistory() { return lsGet("bn_history", []); }
  function setHistory(h) { lsSet("bn_history", h); }

  async function loadServerHistory() {
    try {
      const me = await apiGet(API.me);
      if (!me.logged_in) return null;
      const out = await apiGet(API.history);
      const server = Array.isArray(out?.history) ? out.history : [];
      return server;
    } catch { return null; }
  }

  async function saveServerHistory(h) {
    try {
      const me = await apiGet(API.me);
      if (!me.logged_in) return false;
      await apiPost(API.history, { history: h });
      return true;
    } catch { return false; }
  }

  async function updateSyncStatus() {
    const el = ((id) => document.getElementById(id))("syncStatus");
    const dot = ((id) => document.getElementById(id))("syncDot");
    if (!el) return;
    try {
      const me = await apiGet(API.me);
      if (!me.logged_in) { el.textContent = "OFF"; if (dot) dot.style.background = "rgba(255,120,120,.95)"; return; }
      await apiGet(API.history);
      el.textContent = "ON";
      if (dot) dot.style.background = "rgba(191,230,208,.95)";
    } catch {
      el.textContent = "OFF";
      if (dot) dot.style.background = "rgba(255,120,120,.95)";
    }
  }

  async function syncNow() {
    try {
      const me = await apiGet(API.me);
      if (!me.logged_in) { toast("Sync unavailable", "Sign in to use cloud sync."); return; }
      const h = getHistory();
      const ok = await saveServerHistory(h);
      if (ok) {
        const server = await loadServerHistory();
        if (server && server.length) setHistory(server);
        renderHistory();
        toast("Synced", "Cloud history updated.");
      } else {
        toast("Sync failed", "Could not reach server.");
      }
      updateSyncStatus();
    } catch (e) {
      toast("Sync error", String(e.message || e));
    }
  }


  async function sendChat() {
    const input = ((id) => document.getElementById(id))("chatInput");
    if (!input) return;
    const msg = (input.value || "").trim();
    if (!msg) return;

    input.value = "";
    renderMsg("user", msg);

    const h = getHistory();
    h.push({ role: "user", content: msg });
    while (h.length > 20) h.shift();
    setHistory(h);
    // Try to sync to server if signed in
    saveServerHistory(h).catch(() => {});

    renderMsg("assistant", "Professor Botnotic is thinking...");
    const box = ((id) => document.getElementById(id))("messages");
    const last = box?.lastElementChild;

    try {
      const subject = lsGet("bn_subject", "General");
      const out = await apiPost(API.chat, { message: msg, history: h, subject });
      if (last) last.textContent = out.reply || "";
      h.push({ role: "assistant", content: out.reply || "" });
      while (h.length > 20) h.shift();
      setHistory(h);
      saveServerHistory(h).catch(() => {});
      if (out.plan) setPlan(out.plan);
      const badge = ((id) => document.getElementById(id))("planBadge");
      if (badge) badge.textContent = (out.plan || getPlan()).toUpperCase();
      if (getSpeak() && (out.reply || "").trim()) {
        try {
          const voice = getVoice();
          const tts = await apiPost(API.tts, { text: out.reply || "", voice });
          if (tts.audio_base64) {
            const a = ((id) => document.getElementById(id))("ttsAudio");
            if (a) { a.src = "data:audio/mp3;base64," + tts.audio_base64; a.play().catch(() => {}); }
          }
        } catch {}
      }
    } catch (e) {
      if (last) last.textContent = "Chat failed. Check /api/health and OPENAI_API_KEY.";
      toast("Chat failed", String(e.message || e));
    }
  }

  async function listStorage() {
    try {
      const out = await apiGet(API.storageList);
      const tree = Array.isArray(out?.tree) ? out.tree : [];
      renderStorageTree(tree);
    } catch (e) { toast("Storage error", String(e.message || e)); }
  }
  function renderStorageTree(tree) {
    const box = ((id) => document.getElementById(id))("fsTree");
    const filter = (((id) => document.getElementById(id))("fsSearch")?.value || "").toLowerCase();
    if (!box) return;
    box.innerHTML = "";
    for (const node of tree) {
      const p = String(node.path || "/");
      const files = Array.isArray(node.files) ? node.files : [];
      const dirs = Array.isArray(node.dirs) ? node.dirs : [];
      const wrap = document.createElement("div"); wrap.className = "card"; wrap.style.marginTop = "8px";
      const title = document.createElement("div"); title.textContent = p; title.style.fontWeight = "700"; title.style.fontSize = "12.5px"; title.style.letterSpacing = ".25px";
      wrap.appendChild(title);
      const list = document.createElement("div"); list.style.display = "grid"; list.style.gridTemplateColumns = "1fr 1fr"; list.style.gap = "6px";
      for (const d of dirs) {
        const li = document.createElement("button"); li.className = "btn small"; li.textContent = d + "/";
        li.onclick = () => { const fp = (p === "/" ? d : (p + "/" + d)); ((id) => document.getElementById(id))("fsPath").value = fp + "/"; };
        if (!filter || (d.toLowerCase().includes(filter))) list.appendChild(li);
      }
      for (const f of files) {
        const li = document.createElement("button"); li.className = "btn small"; li.textContent = f;
        li.onclick = () => openFile((p === "/" ? f : (p + "/" + f)));
        if (!filter || (f.toLowerCase().includes(filter))) list.appendChild(li);
      }
      wrap.appendChild(list);
      box.appendChild(wrap);
    }
  }
  async function openFile(path) {
    try {
      const out = await apiPost(API.storageRead, { path });
      const fp = ((id) => document.getElementById(id))("fsPath"); if (fp) fp.value = path;
      const ed = ((id) => document.getElementById(id))("fsEditor"); if (ed) ed.value = out.content || "";
      toast("Opened", path);
    } catch (e) { toast("Open failed", String(e.message || e)); }
  }
  async function saveFile() {
    const path = (((id) => document.getElementById(id))("fsPath")?.value || "").trim();
    const content = (((id) => document.getElementById(id))("fsEditor")?.value || "");
    if (!path) return toast("Missing path", "Enter a file path.");
    try { await apiPost(API.storageWrite, { path, content }); toast("Saved", path); await listStorage(); }
    catch (e) { toast("Save failed", String(e.message || e)); }
  }
  async function deletePath() {
    const path = (((id) => document.getElementById(id))("fsPath")?.value || "").trim();
    if (!path) return toast("Missing path", "Enter a file or folder path.");
    try { await apiPost(API.storageDelete, { path }); toast("Deleted", path); ((id) => document.getElementById(id))("fsEditor").value = ""; await listStorage(); }
    catch (e) { toast("Delete failed", String(e.message || e)); }
  }
  async function newFile() {
    const name = prompt("New file name (relative path)", "report-" + uid() + ".md");
    if (!name) return;
    try { await apiPost(API.storageWrite, { path: name, content: "" }); ((id) => document.getElementById(id))("fsPath").value = name; ((id) => document.getElementById(id))("fsEditor").value = ""; await listStorage(); }
    catch (e) { toast("Create failed", String(e.message || e)); }
  }
  async function newFolder() {
    const name = prompt("New folder name (relative path)", "folder-" + uid());
    if (!name) return;
    try { await apiPost(API.storageWrite, { path: name + "/.keep", content: "" }); ((id) => document.getElementById(id))("fsPath").value = name + "/"; await listStorage(); }
    catch (e) { toast("Create failed", String(e.message || e)); }
  }
  function downloadCurrent() {
    const path = (((id) => document.getElementById(id))("fsPath")?.value || "").trim();
    const content = (((id) => document.getElementById(id))("fsEditor")?.value || "");
    if (!path) return toast("Missing path", "Enter a file path.");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = path.split("/").pop() || "file.txt"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  async function generateQuiz() {
    const topic = (((id) => document.getElementById(id))("quizTopic")?.value || "General").trim();
    const level = (((id) => document.getElementById(id))("quizLevel")?.value || "bachelors").trim();
    const count = parseInt((((id) => document.getElementById(id))("quizCount")?.value || "5"), 10) || 5;
    const mode = (((id) => document.getElementById(id))("quizMode")?.value || "short").trim();
    try {
      const out = await apiPost(API.quizGenerate, { topic, level, count, mode });
      const qs = Array.isArray(out?.questions) ? out.questions : [];
      const limited = qs.slice(0, count);
      const tbody = ((id) => document.getElementById(id))("quizList"); if (!tbody) return;
      tbody.innerHTML = "";
      for (let i = 0; i < limited.length; i++) {
        const tr = document.createElement("tr");
        const qd = document.createElement("td"); qd.textContent = String(limited[i].q || "");
        const ad = document.createElement("td"); const inp = document.createElement("input"); inp.className = "input"; inp.placeholder = "Your answer"; inp.id = "qa_" + i; ad.appendChild(inp);
        tr.appendChild(qd); tr.appendChild(ad); tbody.appendChild(tr);
      }
      lsSet("bn_quiz_questions", limited);
      ((id) => document.getElementById(id))("quizScore").textContent = "Score: 0 / " + limited.length;
      toast("Ready", "Quiz generated.");
    } catch (e) { toast("Quiz error", String(e.message || e)); }
  }
  async function gradeQuiz() {
    const qs = lsGet("bn_quiz_questions", []) || [];
    const answers = [];
    for (let i = 0; i < qs.length; i++) { const v = (((id) => document.getElementById(id))("qa_" + i)?.value || ""); answers.push(v); }
    try {
      const out = await apiPost(API.quizGrade, { questions: qs, answers });
      const s = ((id) => document.getElementById(id))("quizScore"); if (s) s.textContent = "Score: " + (out.score || 0) + " / " + (out.total || 0);
      toast("Graded", s?.textContent || "");
    } catch (e) { toast("Grade error", String(e.message || e)); }
  }

  async function saveQuizSet() {
    const qs = lsGet("bn_quiz_questions", []) || [];
    const topic = (((id) => document.getElementById(id))("quizTopic")?.value || "General").trim();
    const level = (((id) => document.getElementById(id))("quizLevel")?.value || "bachelors").trim();
    const now = new Date();
    const ts = now.toISOString().replace(/[:.]/g, "-");
    const path = `quizzes/${topic || 'General'}-${ts}.json`;
    const content = { topic, level, created_at: now.toISOString(), questions: qs };
    try { await apiPost(API.storageWrite, { path, content }); toast("Saved", path); await listStorage(); }
    catch (e) { toast("Save failed", String(e.message || e)); }
  }

  async function loadLastQuizSet() {
    try {
      const out = await apiGet(API.storageList);
      const tree = Array.isArray(out?.tree) ? out.tree : [];
      let latest = null;
      for (const node of tree) {
        if (String(node.path || "") === "quizzes") {
          for (const f of (node.files || [])) {
            const m = String(f).match(/-(\d{4}-\d{2}-\d{2}T[^-]+)/);
            const t = m ? new Date(m[1]) : null;
            if (t) { if (!latest || t > latest.t) latest = { t, file: f }; }
          }
        }
      }
      if (!latest) return toast("Not found", "No saved quiz sets.");
      const path = `quizzes/${latest.file}`;
      const data = await apiPost(API.storageRead, { path });
      const obj = JSON.parse(data.content || "{}");
      const qs = Array.isArray(obj.questions) ? obj.questions : [];
      lsSet("bn_quiz_questions", qs);
      const tbody = ((id) => document.getElementById(id))("quizList"); if (!tbody) return;
      tbody.innerHTML = "";
      for (let i = 0; i < qs.length; i++) {
        const tr = document.createElement("tr");
        const qd = document.createElement("td"); qd.textContent = String(qs[i].q || "");
        const ad = document.createElement("td"); const inp = document.createElement("input"); inp.className = "input"; inp.placeholder = "Your answer"; inp.id = "qa_" + i; ad.appendChild(inp);
        tr.appendChild(qd); tr.appendChild(ad); tbody.appendChild(tr);
      }
      ((id) => document.getElementById(id))("quizScore").textContent = "Score: 0 / " + qs.length;
      toast("Loaded", path);
    } catch (e) { toast("Load failed", String(e.message || e)); }
  }

  function grabCoffee() {
    const n = (lsGet("bn_coffee", 0) || 0) + 1; lsSet("bn_coffee", n);
    lsSet("bn_focus_until", 0);
    toast("Break time", "Coffee count: " + n);
  }
  function grabPen() {
    const n = (lsGet("bn_pen", 0) || 0) + 1; lsSet("bn_pen", n);
    const ta = ((id) => document.getElementById(id))("fsEditor"); if (ta) ta.focus();
    toast("Ready", "Pen count: " + n);
  }
  async function grabPaper() {
    const name = "paper-" + uid() + ".md";
    const tpl = "# Paper\n\nTitle: \nAuthor: \nDate: " + new Date().toLocaleDateString() + "\n\n## Abstract\n\n\n## Body\n\n";
    try { await apiPost(API.storageWrite, { path: name, content: tpl }); ((id) => document.getElementById(id))("fsPath").value = name; ((id) => document.getElementById(id))("fsEditor").value = tpl; await listStorage(); toast("Paper ready", name); }
    catch (e) { toast("Paper error", String(e.message || e)); }
  }

  async function health() {

    try {
      const out = await apiGet(API.health);
      const dot = ((id) => document.getElementById(id))("healthDot");
      if (dot) dot.style.background = out.status === "ok" ? "rgba(191,230,208,.95)" : "rgba(255,120,120,.95)";
      const line = ((id) => document.getElementById(id))("healthLine");
      if (line) line.textContent = `API: ${out.status} • OpenAI: ${out.openai ? "ON" : "OFF"} • Stripe: ${out.stripe ? "ON" : "OFF"}`;
    } catch {
      const line = ((id) => document.getElementById(id))("healthLine");
      if (line) line.textContent = "API: OFFLINE";
    }
  }

  async function loadAnnouncements() {
    try {
      const out = await apiGet(API.announcements);
      const items = Array.isArray(out?.items) ? out.items : [];
      const box = ((id) => document.getElementById(id))("announcementsList");
      if (!box) return;
      box.innerHTML = "";
      if (!items.length) {
        const d = document.createElement("div"); d.className = "smallmuted"; d.textContent = "No announcements."; box.appendChild(d);
        return;
      }
      for (const it of items.slice(0,50)) {
        const d = document.createElement("div"); d.className = "smallmuted";
        const txt = String((it && it.text) || it || "");
        let dateStr = "";
        try { if (it && it.date) { const dt = new Date(it.date); if (!isNaN(dt.getTime())) dateStr = ` — ${dt.toLocaleDateString()}`; } } catch {}
        d.textContent = txt + dateStr; box.appendChild(d);
      }
    } catch {}
  }

  async function addAnnouncement() {
    const inp = ((id) => document.getElementById(id))("announceText");
    if (!inp) return;
    const text = (inp.value || "").trim();
    if (!text) return toast("Missing text", "Write an announcement first.");
    try {
      await apiPost(API.announcements, { text });
      inp.value = "";
      await loadAnnouncements();
      toast("Posted", "Announcement added.");
    } catch (e) {
      toast("Post failed", String(e.message || e));
    }
  }

  function parseCheckoutSuccess() {
    const u = new URL(location.href);
    const ok = u.searchParams.get("checkout");
    const plan = u.searchParams.get("plan");
    if (ok === "success" && plan) {
      setPlan(plan);
      toast("Checkout complete", `Plan set to ${plan.toUpperCase()}.`);
      // Prompt for ID badge photo after subscription
      openBadgeModal();
      u.searchParams.delete("checkout");
      history.replaceState({}, "", u.toString());
    }
  }

  async function startCheckout(plan, cadence) {
    const student_id = getStudentId();
    const email = (localStorage.getItem("bn_email") || "").trim() || undefined;
    try {
      const out = await apiPost(API.checkout, { plan, cadence, student_id, email });
      location.href = out.url;
    } catch (e) {
      toast("Stripe error", String(e.message || e));
    }
  }



  function renderHistory() {
    const box = ((id) => document.getElementById(id))("messages");
    if (!box) return;
    box.innerHTML = "";
    const h = getHistory();
    for (const m of h) {
      if (!m || !m.role || typeof m.content !== "string") continue;
      renderMsg(m.role, m.content);
    }
    if (!h.length) renderMsg("assistant", "No saved messages yet.");
  }

  function exportHistory() {
    const h = getHistory();
    const student_id = getStudentId();
    const blob = new Blob([JSON.stringify(h, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `botnoloy101-chat-${student_id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Exported", "Chat history downloaded as JSON.");
  }

  function importHistoryFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result || "[]");
        if (!Array.isArray(data)) throw new Error("Invalid format");
        const cleaned = data.filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
        setHistory(cleaned);
        renderHistory();
        toast("Imported", `Loaded ${cleaned.length} messages.`);
      } catch (e) {
        toast("Import failed", String(e.message || e));
      }
    };
    reader.readAsText(file);
  }

  function exportSession() {
    const now = new Date();
    const student_id = getStudentId();
    const subject = getSubject();
    const start = lsGet("bn_focus_start", 0) || 0;
    const until = lsGet("bn_focus_until", 0) || 0;
    const running = until && until > Date.now();
    const elapsedMs = start ? Math.max(0, (running ? Date.now() : Math.min(Date.now(), until)) - start) : 0;
    const elapsedMin = Math.floor(elapsedMs / 60000);

    const notes = lsGet("bn_notes", "") || "";
    const history = getHistory();
    const last = history.slice(-20);

    const lines = [];
    lines.push(`# Study Session — Professor Botnotic`);
    lines.push("");
    lines.push(`- Date: ${now.toLocaleString()}`);
    lines.push(`- Student: ${student_id}`);
    lines.push(`- Subject: ${subject}`);
    lines.push(`- Focus: ${elapsedMin} min ${running ? "(in progress)" : "(completed/paused)"}`);
    lines.push("");
    lines.push(`## Recent Messages`);
    if (last.length === 0) {
      lines.push("(No messages)");
    } else {
      for (const m of last) {
        const role = m.role === "user" ? "You" : "Professor Botnotic";
        const txt = String(m.content || "").replace(/\r?\n/g, "\n");
        lines.push(`- **${role}:** ${txt}`);
      }
    }
    lines.push("");
    lines.push(`## Notes`);
    lines.push(notes ? notes : "(No notes)\n");

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `botnoloy101-session-${student_id}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Exported", "Session summary downloaded as Markdown.");
  }

  function wireGlobal() {
    ((id) => document.getElementById(id))("openAuth") && (((id) => document.getElementById(id))("openAuth").onclick = openModal);
    ((id) => document.getElementById(id))("closeAuth") && (((id) => document.getElementById(id))("closeAuth").onclick = closeModal);
    ((id) => document.getElementById(id))("doAuth") && (((id) => document.getElementById(id))("doAuth").onclick = () => doAuth().catch(e => toast("Sign-in failed", String(e.message || e))));

    ((id) => document.getElementById(id))("goDash") && (((id) => document.getElementById(id))("goDash").onclick = () => location.href = "/dashboard.html");
    ((id) => document.getElementById(id))("goPricing") && (((id) => document.getElementById(id))("goPricing").onclick = () => location.href = "/pricing.html");
    ((id) => document.getElementById(id))("goHome") && (((id) => document.getElementById(id))("goHome").onclick = () => location.href = "/index.html");
    ((id) => document.getElementById(id))("openBadge") && (((id) => document.getElementById(id))("openBadge").onclick = () => openBadgeModal());
    ((id) => document.getElementById(id))("closeBadge") && (((id) => document.getElementById(id))("closeBadge").onclick = () => closeBadgeModal());
    ((id) => document.getElementById(id))("saveBadgePhoto") && (((id) => document.getElementById(id))("saveBadgePhoto").onclick = () => saveBadgePhoto().catch(e => toast("Save failed", String(e.message || e))));
    ((id) => document.getElementById(id))("badgeFile") && (((id) => document.getElementById(id))("badgeFile").addEventListener("change", handleBadgeFile));
    ((id) => document.getElementById(id))("shapeCircle") && (((id) => document.getElementById(id))("shapeCircle").onclick = () => applyBadgeShape("circle"));
    ((id) => document.getElementById(id))("shapeSquare") && (((id) => document.getElementById(id))("shapeSquare").onclick = () => applyBadgeShape("square"));
    ((id) => document.getElementById(id))("cropReset") && (((id) => document.getElementById(id))("cropReset").onclick = () => resetCrop());
    ((id) => document.getElementById(id))("goStudy") && (((id) => document.getElementById(id))("goStudy").onclick = () => location.href = "/study-hall.html");

    ((id) => document.getElementById(id))("sendBtn") && (((id) => document.getElementById(id))("sendBtn").onclick = () => sendChat());
    ((id) => document.getElementById(id))("chatInput") && (((id) => document.getElementById(id))("chatInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }
    }));

    ((id) => document.getElementById(id))("resumeBtn") && (((id) => document.getElementById(id))("resumeBtn").onclick = () => renderHistory());
    ((id) => document.getElementById(id))("exportBtn") && (((id) => document.getElementById(id))("exportBtn").onclick = () => exportHistory());
    ((id) => document.getElementById(id))("importBtn") && (((id) => document.getElementById(id))("importBtn").onclick = () => ((id) => document.getElementById(id))("importFile")?.click());
    ((id) => document.getElementById(id))("importFile") && (((id) => document.getElementById(id))("importFile").addEventListener("change", (e) => importHistoryFile(e.target.files?.[0])));
    ((id) => document.getElementById(id))("syncNow") && (((id) => document.getElementById(id))("syncNow").onclick = () => syncNow());

    ((id) => document.getElementById(id))("sessionExport") && (((id) => document.getElementById(id))("sessionExport").onclick = () => exportSession());

    // Theme toggle
    ((id) => document.getElementById(id))("themeToggle") && (((id) => document.getElementById(id))("themeToggle").onclick = () => {
      const isYeti = document.body.classList.contains("yeti-theme");
      applyTheme(isYeti ? "default" : "yeti");
      updateThemeButton();
    });

    // Study Hall wiring
    ((id) => document.getElementById(id))("subjectSelect") && (((id) => document.getElementById(id))("subjectSelect").addEventListener("change", (e) => setSubject(e.target.value)));
    ((id) => document.getElementById(id))("focusStart") && (((id) => document.getElementById(id))("focusStart").onclick = () => startFocus(25));
    ((id) => document.getElementById(id))("notesArea") && (((id) => document.getElementById(id))("notesArea").addEventListener("input", (e) => lsSet("bn_notes", e.target.value)));
    ((id) => document.getElementById(id))("notesExport") && (((id) => document.getElementById(id))("notesExport").onclick = () => {
      const blob = new Blob([lsGet("bn_notes", "")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `botnoloy101-notes-${getStudentId()}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });
    ((id) => document.getElementById(id))("notesClear") && (((id) => document.getElementById(id))("notesClear").onclick = () => { lsSet("bn_notes", ""); const ta = ((id) => document.getElementById(id))("notesArea"); if (ta) ta.value = ""; });
  }

  function applyTheme(name) {
    const useYeti = (name || "default") === "yeti";
    document.body.classList.toggle("yeti-theme", useYeti);
    try { localStorage.setItem("bn_theme", useYeti ? "yeti" : "default"); } catch {}
  }

  function updateThemeButton() {
    const btn = ((id) => document.getElementById(id))("themeToggle");
    if (btn) btn.textContent = document.body.classList.contains("yeti-theme") ? "Default Theme" : "Yeti Mode";
  }

  async function boot() {
    console.log("Botnoloy101 UI loaded OK");
    // Theme from localStorage
    applyTheme(localStorage.getItem("bn_theme") || "default");
    updateThemeButton();
    getStudentId();
    parseCheckoutSuccess();
    wireGlobal();
    await health();
    const me = await syncMe();
    await loadAnnouncements();
    // Swap Dr. Botonic portrait if a real photo is present
    await swapBotonicPortrait().catch(() => {});
    // If a messages box exists on this page, render saved history automatically.
    const box = ((id) => document.getElementById(id))("messages");
    if (box) {
      // Prefer server history when signed in; fall back to local.
      const server = await loadServerHistory();
      if (server && server.length) {
        setHistory(server);
      }
      renderHistory();
      updateSyncStatus();
    }
    // Study Hall initial state
    setSubject(getSubject());
    const ta = ((id) => document.getElementById(id))("notesArea"); if (ta) ta.value = lsGet("bn_notes", "");
    tickFocus();
    updateSyncStatus();
    setSpeak(getSpeak());
    setVoice(getVoice());
    const fsTree = ((id) => document.getElementById(id))("fsTree"); if (fsTree) { await listStorage(); }
    updatePlanGates(getPlan());
  }

  document.addEventListener("DOMContentLoaded", () => { 
    boot().catch(() => {});
    initCrop();
    // Load badge photo early; portrait application will respect file override
    Promise.resolve().then(() => loadBadgePhoto()).catch(() => {});
  });
  });

  // Track whether a real portrait file was applied (take precedence over badge)
  let _botonicPortraitLocked = false;

  async function swapBotonicPortrait() {
    const candidates = ["/dr-botonic.jpg", "/dr-botonic.png"]; // drop-in overrides
    let use = null;
    for (const p of candidates) {
      try { const r = await fetch(p, { method: "HEAD" }); if (r.ok) { use = p; break; } } catch {}
    }
    if (!use) return; // If a drop-in file exists, prefer it
    _botonicPortraitLocked = true;
    const imgs = document.querySelectorAll('img[data-botonic="true"]');
    imgs.forEach(img => { img.src = use; img.style.objectFit = "cover"; img.style.background = "#0a1811"; });
  }

  function applyPortraitFromBadge() {
    async function applyPortraitFromBadge() {
      try {
        if (_botonicPortraitLocked) return; // real file already applied
        // If a file override exists, do not apply badge portrait
        try {
          const r1 = await fetch("/dr-botonic.jpg", { method: "HEAD" });
          const r2 = await fetch("/dr-botonic.png", { method: "HEAD" });
          if (r1.ok || r2.ok) return;
        } catch {}
        const badge = ((id) => document.getElementById(id))("badgePhoto");
        const src = badge?.src || "";
        if (!src) return;
        const imgs = document.querySelectorAll('img[data-botonic="true"]');
        imgs.forEach(img => { img.src = src; img.style.objectFit = "cover"; img.style.background = "#0a1811"; });
      } catch {}
  }

  // ------ Badge photo helpers ------
  async function loadBadgePhoto() {
    try {
      const out = await apiGet(API.photo);
      const b64 = out.photo_base64 || localStorage.getItem("bn_photo_b64") || null;
      const img = ((id) => document.getElementById(id))("badgePhoto");
      if (b64 && img) img.src = `data:image/png;base64,${b64}`;
      if (b64) setCropImage(`data:image/png;base64,${b64}`);
      applyBadgeShape(localStorage.getItem("bn_photo_shape") || "circle");
    } catch {
      const b64 = localStorage.getItem("bn_photo_b64");
      const img = ((id) => document.getElementById(id))("badgePhoto");
      if (b64 && img) img.src = `data:image/png;base64,${b64}`;
      if (b64) setCropImage(`data:image/png;base64,${b64}`);
      applyBadgeShape(localStorage.getItem("bn_photo_shape") || "circle");
    }
  }

  function handleBadgeFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === "string") {
        setCropImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  async function saveBadgePhoto() {
    const finalB64 = await renderCroppedPhoto();
    if (!finalB64) throw new Error("Select a photo first");
    try {
      await apiPost(API.photo, { photo_base64: finalB64 });
      const img = ((id) => document.getElementById(id))("badgePhoto");
      if (img) img.src = `data:image/png;base64,${finalB64}`;
      applyBadgeShape(localStorage.getItem("bn_photo_shape") || "circle");
      try { await applyPortraitFromBadge(); } catch {}
      closeBadgeModal();
      toast("Saved", "ID badge photo updated.");
    } catch (e) {
      toast("Save failed", String(e.message || e));
    }
  }

  function applyBadgeShape(shape) {
    try { localStorage.setItem("bn_photo_shape", shape); } catch {}
    const circleBtn = ((id) => document.getElementById(id))("shapeCircle");
    const squareBtn = ((id) => document.getElementById(id))("shapeSquare");
    circleBtn && circleBtn.classList.toggle("active", shape === "circle");
    squareBtn && squareBtn.classList.toggle("active", shape === "square");
    const prev = ((id) => document.getElementById(id))("cropBox");
    const img = ((id) => document.getElementById(id))("badgePhoto");
    const br = shape === "circle" ? "999px" : "12px";
    if (prev) prev.style.borderRadius = br;
    if (img) img.style.borderRadius = br;
  }

  // ------ Crop utils ------
  let cropState = { scale: 1, offsetX: 0, offsetY: 0, iw: 0, ih: 0 };
  function initCrop() {
    const box = ((id) => document.getElementById(id))("cropBox");
    const img = ((id) => document.getElementById(id))("cropImg");
    const zoom = ((id) => document.getElementById(id))("cropZoom");
    const sizeSel = ((id) => document.getElementById(id))("cropSize");
    const fmtSel = ((id) => document.getElementById(id))("cropFormat");
    const qualSel = ((id) => document.getElementById(id))("cropQuality");
    if (!box || !img || !zoom) return;
    const minZoom = parseFloat(zoom.min || "1");
    const maxZoom = parseFloat(zoom.max || "3");
      // Persist/export size
      try { const savedSize = localStorage.getItem("bn_photo_size"); if (sizeSel && savedSize) sizeSel.value = savedSize; } catch {}
      sizeSel && sizeSel.addEventListener("change", () => { try { localStorage.setItem("bn_photo_size", sizeSel.value); } catch {} });
      // Persist/export format + quality
      try { const savedFmt = localStorage.getItem("bn_photo_fmt"); if (fmtSel && savedFmt) fmtSel.value = savedFmt; } catch {}
      try { const savedQ = localStorage.getItem("bn_photo_q"); if (qualSel && savedQ) qualSel.value = savedQ; } catch {}
      fmtSel && fmtSel.addEventListener("change", () => { try { localStorage.setItem("bn_photo_fmt", fmtSel.value); } catch {} updateExportPreview(); });
      qualSel && qualSel.addEventListener("input", () => { try { localStorage.setItem("bn_photo_q", qualSel.value); } catch {} updateExportPreview(); });
      sizeSel && sizeSel.addEventListener("change", updateExportPreview);
      updateExportPreview();
    zoom.oninput = () => {
      cropState.scale = Math.max(minZoom, Math.min(maxZoom, parseFloat(zoom.value || "1")));
      applyCropTransform();
    };
    let dragging = false, sx = 0, sy = 0;
    box.addEventListener("mousedown", (ev) => { dragging = true; sx = ev.clientX; sy = ev.clientY; box.classList.add("drag"); });
    window.addEventListener("mouseup", () => { dragging = false; box.classList.remove("drag"); });
    window.addEventListener("mousemove", (ev) => {
      if (!dragging) return;
      const dx = ev.clientX - sx; const dy = ev.clientY - sy; sx = ev.clientX; sy = ev.clientY;
      cropState.offsetX += dx; cropState.offsetY += dy; applyCropTransform();
    });
    // Mouse wheel zoom
    box.addEventListener("wheel", (ev) => {
      ev.preventDefault();
      const step = -ev.deltaY / 500; // invert for natural zoom
      const target = Math.max(minZoom, Math.min(maxZoom, cropState.scale * (1 + step)));
      const rect = box.getBoundingClientRect();
      const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
      const px = x - rect.width/2; const py = y - rect.height/2;
      const old = cropState.scale || 1; const factor = 1 - (target / old);
      cropState.offsetX += px * factor; cropState.offsetY += py * factor;
      cropState.scale = target;
      zoom.value = String(target);
      applyCropTransform();
    }, { passive: false });
    // Desktop double-click zoom toggle
    box.addEventListener("dblclick", (ev) => {
      ev.preventDefault();
      const target = cropState.scale <= (minZoom + 0.05) ? Math.min(maxZoom, minZoom * 2) : minZoom;
      const rect = box.getBoundingClientRect();
      const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
      const px = x - rect.width/2; const py = y - rect.height/2;
      const old = cropState.scale || 1; const factor = 1 - (target / old);
      cropState.offsetX += px * factor; cropState.offsetY += py * factor;
      cropState.scale = target;
      zoom.value = String(target);
      applyCropTransform();
    });
    // Touch gestures: drag + pinch zoom
    let touchDragging = false, lastTx = 0, lastTy = 0;
    let pinchActive = false, pinchStartDist = 0, pinchStartScale = 1;
    let lastTapTime = 0, lastTapX = 0, lastTapY = 0;
    function dist2(t0, t1) { const dx = t0.clientX - t1.clientX, dy = t0.clientY - t1.clientY; return Math.hypot(dx, dy); }
    box.addEventListener("touchstart", (ev) => {
      if (ev.touches.length === 1) {
        const now = Date.now();
        const tx = ev.touches[0].clientX; const ty = ev.touches[0].clientY;
        if ((now - lastTapTime) < 300 && Math.hypot(tx - lastTapX, ty - lastTapY) < 30) {
          // Double-tap zoom toggle
          const target = cropState.scale <= (minZoom + 0.05) ? Math.min(maxZoom, minZoom * 2) : minZoom;
          const rect = box.getBoundingClientRect();
          const x = tx - rect.left; const y = ty - rect.top;
          const px = x - rect.width/2; const py = y - rect.height/2;
          const old = cropState.scale || 1; const factor = 1 - (target / old);
          cropState.offsetX += px * factor; cropState.offsetY += py * factor;
          cropState.scale = target;
          zoom.value = String(target);
          applyCropTransform();
          touchDragging = false; pinchActive = false; box.classList.remove("drag");
          lastTapTime = 0; // reset
          ev.preventDefault();
          return;
        }
        lastTapTime = now; lastTapX = tx; lastTapY = ty;
        touchDragging = true; pinchActive = false; lastTx = tx; lastTy = ty; box.classList.add("drag");
      } else if (ev.touches.length >= 2) {
        pinchActive = true; touchDragging = false; pinchStartDist = dist2(ev.touches[0], ev.touches[1]); pinchStartScale = cropState.scale; box.classList.add("drag");
      }
      ev.preventDefault();
    }, { passive: false });
    box.addEventListener("touchmove", (ev) => {
      if (pinchActive && ev.touches.length >= 2) {
        const d = dist2(ev.touches[0], ev.touches[1]);
        let s = (pinchStartScale * (d / Math.max(1, pinchStartDist)));
        s = Math.max(minZoom, Math.min(maxZoom, s));
        cropState.scale = s; zoom.value = String(s);
        applyCropTransform();
      } else if (touchDragging && ev.touches.length === 1) {
        const tx = ev.touches[0].clientX, ty = ev.touches[0].clientY;
        const dx = tx - lastTx, dy = ty - lastTy; lastTx = tx; lastTy = ty;
        cropState.offsetX += dx; cropState.offsetY += dy;
        applyCropTransform();
      }
      ev.preventDefault();
    }, { passive: false });
    box.addEventListener("touchend", (ev) => {
      if (ev.touches.length === 0) { touchDragging = false; pinchActive = false; box.classList.remove("drag"); }
      else if (ev.touches.length === 1) { pinchActive = false; }
    });
    img.onload = () => { cropState.iw = img.naturalWidth || 0; cropState.ih = img.naturalHeight || 0; cropState.offsetX = 0; cropState.offsetY = 0; applyCropTransform(); };
  }
  function setCropImage(dataUrl) {
    const img = ((id) => document.getElementById(id))("cropImg");
    const zoom = ((id) => document.getElementById(id))("cropZoom");
    cropState = { scale: 1, offsetX: 0, offsetY: 0, iw: 0, ih: 0 };
    if (img) img.src = dataUrl;
    if (zoom) zoom.value = "1";
  }
  function resetCrop() {
    const zoom = ((id) => document.getElementById(id))("cropZoom");
    cropState.scale = 1; cropState.offsetX = 0; cropState.offsetY = 0;
    if (zoom) zoom.value = "1";
    applyCropTransform();
  }
  function applyCropTransform() {
    const img = ((id) => document.getElementById(id))("cropImg");
    const box = ((id) => document.getElementById(id))("cropBox");
    if (!img) return;
    // Keep image within crop bounds
    if (box) {
      const W = box.offsetWidth || 160; const H = box.offsetHeight || 160;
      const s = cropState.scale || 1; const iw = cropState.iw || img.naturalWidth || 0; const ih = cropState.ih || img.naturalHeight || 0;
      const maxX = Math.max(0, (iw*s - W) / 2);
      const maxY = Math.max(0, (ih*s - H) / 2);
      cropState.offsetX = Math.max(-maxX, Math.min(maxX, cropState.offsetX));
      cropState.offsetY = Math.max(-maxY, Math.min(maxY, cropState.offsetY));
    }
    img.style.transform = `translate(calc(-50% + ${cropState.offsetX}px), calc(-50% + ${cropState.offsetY}px)) scale(${cropState.scale})`;
  }
  async function renderCroppedPhoto() {
    const img = ((id) => document.getElementById(id))("cropImg");
    const box = ((id) => document.getElementById(id))("cropBox");
    const sizeSel = ((id) => document.getElementById(id))("cropSize");
    const fmtSel = ((id) => document.getElementById(id))("cropFormat");
    const qualSel = ((id) => document.getElementById(id))("cropQuality");
    if (!img || !box || !img.src) return "";
    const W = box.offsetWidth || 160; const H = box.offsetHeight || 160;
    const canvas = document.createElement("canvas"); const cw = parseInt(sizeSel?.value || (localStorage.getItem("bn_photo_size") || "512"), 10) || 512, ch = cw; canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext("2d"); if (!ctx) return "";
    const s = cropState.scale || 1; const iw = cropState.iw || img.naturalWidth || 0; const ih = cropState.ih || img.naturalHeight || 0;
    const centerX = W/2 + cropState.offsetX; const centerY = H/2 + cropState.offsetY;
    const imgTopLeftX = centerX - (iw*s)/2; const imgTopLeftY = centerY - (ih*s)/2;
    const sx = (0 - imgTopLeftX) / s; const sy = (0 - imgTopLeftY) / s; const sWidth = W / s; const sHeight = H / s;
    const tmpImg = new Image(); tmpImg.src = img.src;
    await new Promise(res => { tmpImg.onload = res; tmpImg.onerror = res; });
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(tmpImg, sx, sy, sWidth, sHeight, 0, 0, cw, ch);
    const shape = localStorage.getItem("bn_photo_shape") || "circle";
    const fmt = (fmtSel?.value || localStorage.getItem("bn_photo_fmt") || "png").toLowerCase();
    const q = Math.max(0.5, Math.min(0.98, parseFloat(qualSel?.value || (localStorage.getItem("bn_photo_q") || "0.92")) || 0.92));
    if (fmt === "png" && shape === "circle") {
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath(); ctx.arc(cw/2, ch/2, Math.min(cw,ch)/2, 0, Math.PI*2); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    const dataUrl = fmt === "jpeg" ? canvas.toDataURL("image/jpeg", q) : canvas.toDataURL("image/png");
    const b64 = dataUrl.split(",")[1] || "";
    try { localStorage.setItem("bn_photo_b64", b64); } catch {}
    return b64;
  }

  function updateExportPreview() {
    const sizeSel = ((id) => document.getElementById(id))("cropSize");
    const fmtSel = ((id) => document.getElementById(id))("cropFormat");
    const qualSel = ((id) => document.getElementById(id))("cropQuality");
    const out = ((id) => document.getElementById(id))("exportPreview");
    if (!out) return;
    const size = parseInt(sizeSel?.value || (localStorage.getItem("bn_photo_size") || "512"), 10) || 512;
    const fmt = (fmtSel?.value || localStorage.getItem("bn_photo_fmt") || "png").toUpperCase();
    const q = parseFloat(qualSel?.value || (localStorage.getItem("bn_photo_q") || "0.92")) || 0.92;
    out.textContent = fmt === "JPEG" ? `Output: ${size}×${size} ${fmt} (${Math.round(q*100)}%)` : `Output: ${size}×${size} ${fmt}`;
  }

  function updatePlanGates(plan) {
    plan = (plan || getPlan() || "associates").toLowerCase();
    const voicePanel = ((id) => document.getElementById(id))("voicePanel");
    const quizAdv = ((id) => document.getElementById(id))("quizAdvanced");
    const speakToggle = ((id) => document.getElementById(id))("speakToggle");
    const voiceSelect = ((id) => document.getElementById(id))("voiceSelect");
    const isMasters = plan === "masters";
    if (voicePanel) voicePanel.style.display = isMasters ? "block" : "none";
    if (quizAdv) quizAdv.style.display = isMasters ? "flex" : "none";
    if (speakToggle) speakToggle.disabled = !isMasters;
    if (voiceSelect) voiceSelect.disabled = !isMasters;
    const announceCtrls = ((id) => document.getElementById(id))("announceControls");
    if (announceCtrls) announceCtrls.style.display = isMasters ? "flex" : "none";
    if (isMasters) { setSpeak(true); }
  }

  document.addEventListener("DOMContentLoaded", () => {
    ((id) => document.getElementById(id))("fsRefresh") && (((id) => document.getElementById(id))("fsRefresh").onclick = () => listStorage());
    ((id) => document.getElementById(id))("fsSearch") && (((id) => document.getElementById(id))("fsSearch").addEventListener("input", () => listStorage()));
    ((id) => document.getElementById(id))("fsSave") && (((id) => document.getElementById(id))("fsSave").onclick = () => saveFile());
    ((id) => document.getElementById(id))("fsDelete") && (((id) => document.getElementById(id))("fsDelete").onclick = () => deletePath());
    ((id) => document.getElementById(id))("fsNewFile") && (((id) => document.getElementById(id))("fsNewFile").onclick = () => newFile());
    ((id) => document.getElementById(id))("fsNewFolder") && (((id) => document.getElementById(id))("fsNewFolder").onclick = () => newFolder());
    ((id) => document.getElementById(id))("fsDownload") && (((id) => document.getElementById(id))("fsDownload").onclick = () => downloadCurrent());
    ((id) => document.getElementById(id))("quizGenerate") && (((id) => document.getElementById(id))("quizGenerate").onclick = () => generateQuiz());
    ((id) => document.getElementById(id))("quizGrade") && (((id) => document.getElementById(id))("quizGrade").onclick = () => gradeQuiz());
    ((id) => document.getElementById(id))("quizSave") && (((id) => document.getElementById(id))("quizSave").onclick = () => saveQuizSet());
    ((id) => document.getElementById(id))("quizLoadLast") && (((id) => document.getElementById(id))("quizLoadLast").onclick = () => loadLastQuizSet());
    ((id) => document.getElementById(id))("coffeeBtn") && (((id) => document.getElementById(id))("coffeeBtn").onclick = () => grabCoffee());
    ((id) => document.getElementById(id))("penBtn") && (((id) => document.getElementById(id))("penBtn").onclick = () => grabPen());
    ((id) => document.getElementById(id))("paperBtn") && (((id) => document.getElementById(id))("paperBtn").onclick = () => grabPaper());
    ((id) => document.getElementById(id))("speakToggle") && (((id) => document.getElementById(id))("speakToggle").addEventListener("change", (e) => setSpeak(!!e.target.checked)));
    ((id) => document.getElementById(id))("voiceSelect") && (((id) => document.getElementById(id))("voiceSelect").addEventListener("change", (e) => setVoice(e.target.value)));
    ((id) => document.getElementById(id))("announceAdd") && (((id) => document.getElementById(id))("announceAdd").onclick = () => addAnnouncement());
  });
  
