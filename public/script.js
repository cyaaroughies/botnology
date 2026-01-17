  const API = {
    health: "/api/health",
    chat: "/api/chat",
    auth: "/api/auth",
    me: "/api/me",
    checkout: "/api/stripe/create-checkout-session"
  };

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

  function openModal() { const m = ((id) => document.getElementById(id))("authModal"); if (m) m.style.display = "flex"; }
  function closeModal() { const m = ((id) => document.getElementById(id))("authModal"); if (m) m.style.display = "none"; }

  async function syncMe() {
    const badge = ((id) => document.getElementById(id))("planBadge");
    try {
      const me = await apiGet(API.me);
      if (me.logged_in) {
        setPlan(me.plan || getPlan());
        if (badge) badge.textContent = (me.plan || "associates").toUpperCase();
        const who = ((id) => document.getElementById(id))("whoami");
        if (who) who.textContent = `${me.name} • ${me.student_id}`;
        return me;
      }
    } catch { }
    if (badge) badge.textContent = getPlan().toUpperCase();
    const who = ((id) => document.getElementById(id))("whoami");
    if (who) who.textContent = `Guest • ${getStudentId()}`;
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

    renderMsg("assistant", "Dr. Botonic is thinking...");
    const box = ((id) => document.getElementById(id))("messages");
    const last = box?.lastElementChild;

    try {
      const subject = lsGet("bn_subject", "General");
      const out = await apiPost(API.chat, { message: msg, history: h, subject });
      if (last) last.textContent = out.reply || "";
      h.push({ role: "assistant", content: out.reply || "" });
      while (h.length > 20) h.shift();
      setHistory(h);
      if (out.plan) setPlan(out.plan);
      const badge = ((id) => document.getElementById(id))("planBadge");
      if (badge) badge.textContent = (out.plan || getPlan()).toUpperCase();
    } catch (e) {
      if (last) last.textContent = "Chat failed. Check /api/health and OPENAI_API_KEY.";
      toast("Chat failed", String(e.message || e));
    }
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

  function parseCheckoutSuccess() {
    const u = new URL(location.href);
    const ok = u.searchParams.get("checkout");
    const plan = u.searchParams.get("plan");
    if (ok === "success" && plan) {
      setPlan(plan);
      toast("Checkout complete", `Plan set to ${plan.toUpperCase()}.`);
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



  function wireGlobal() {}    ((id) => document.getElementById(id))("openAuth") && (((id) => document.getElementById(id))("openAuth").onclick = openModal);
    ((id) => document.getElementById(id))("closeAuth") && (((id) => document.getElementById(id))("closeAuth").onclick = closeModal);
    ((id) => document.getElementById(id))("doAuth") && (((id) => document.getElementById(id))("doAuth").onclick = () => doAuth().catch(e => toast("Sign-in failed", String(e.message || e))));

    ((id) => document.getElementById(id))("goDash") && (((id) => document.getElementById(id))("goDash").onclick = () => location.href = "/dashboard.html");
    ((id) => document.getElementById(id))("goPricing") && (((id) => document.getElementById(id))("goPricing").onclick = () => location.href = "/pricing.html");
    ((id) => document.getElementById(id))("goHome") && (((id) => document.getElementById(id))("goHome").onclick = () => location.href = "/index.html");

    ((id) => document.getElementById(id))("sendBtn") && (((id) => document.getElementById(id))("sendBtn").onclick = () => sendChat());
    ((id) => document.getElementById(id))("chatInput") && (((id) => document.getElementById(id))("chatInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }

      async function boot() {
        console.log("Botnology UI loaded OK");
        getStudentId();
        parseCheckoutSuccess();
        wireGlobal();
        await health();
        await syncMe();
      }
    }));
  
