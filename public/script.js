// ==========================================
// API BASE URL
// ==========================================
function getApiBaseUrl() {
  const fromWindow = (window.BOTNOLOGY_API_BASE_URL || "").trim();
  const meta = document.querySelector('meta[name="botnology-api-base"]');
  const fromMeta = (meta?.getAttribute("content") || "").trim();
  const fromStorage = (localStorage.getItem("botnology_api_base") || "").trim();
  const base = fromWindow || fromMeta || fromStorage || "";
  return base.replace(/\/$/, "");
}

const API_BASE_URL = getApiBaseUrl();

function apiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
}

async function apiFetchJson(path, options) {
  const response = await fetch(apiUrl(path), options);
  const contentType = response.headers.get("Content-Type") || "";
  const bodyText = await response.text();
  let parsed;
  if (contentType.includes("application/json")) {
    try {
      parsed = JSON.parse(bodyText);
    } catch (error) {
      parsed = { detail: bodyText };
    }
  } else {
    parsed = { detail: bodyText };
  }

  if (!response.ok) {
    const message = parsed?.detail || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = parsed;
    throw error;
  }

  return parsed;
}

// ==========================================
// FREE CHAT LIMIT
// ==========================================
const FREE_CHAT_LIMIT = 7;
const FREE_CHAT_COUNT_KEY = "botnology_free_chat_count";
const CHAT_HISTORY_KEY = "botnology_chat_history";
const SYNC_ENABLED_KEY = "botnology_sync_enabled";
let cachedProfile = null;

function getFreeChatCount() {
  const raw = localStorage.getItem(FREE_CHAT_COUNT_KEY);
  const parsed = Number.parseInt(raw || "0", 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function incrementFreeChatCount() {
  const next = getFreeChatCount() + 1;
  localStorage.setItem(FREE_CHAT_COUNT_KEY, String(next));
  return next;
}

function isPaidPlan(plan) {
  return plan === "bachelors" || plan === "masters";
}

async function getProfile() {
  if (cachedProfile) return cachedProfile;
  const token = localStorage.getItem("botnology_token") || "";
  if (!token) {
    cachedProfile = { logged_in: false, plan: "associates" };
    return cachedProfile;
  }

  try {
    const data = await apiFetchJson("/api/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    cachedProfile = data;
  } catch (error) {
    cachedProfile = { logged_in: false, plan: "associates" };
  }

  return cachedProfile;
}

function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveChatHistory(history) {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}

function getSyncEnabled() {
  return localStorage.getItem(SYNC_ENABLED_KEY) === "true";
}

function setSyncEnabled(enabled) {
  localStorage.setItem(SYNC_ENABLED_KEY, enabled ? "true" : "false");
}

function getAuthToken() {
  return localStorage.getItem("botnology_token") || "";
}

function appendMessage(messagesEl, role, content) {
  const bubble = document.createElement("div");
  bubble.className = `msg ${role === "user" ? "user" : "assistant"}`;
  bubble.textContent = content;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

function renderHistory(messagesEl, history) {
  messagesEl.innerHTML = "";
  history.forEach(item => {
    if (item && item.role && item.content) {
      appendMessage(messagesEl, item.role, item.content);
    }
  });
}

async function streamChatReply(payload, onDelta) {
  const token = getAuthToken();
  const response = await fetch(apiUrl("/api/chat/stream"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const chunk = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);
      if (chunk.startsWith("data:")) {
        const jsonText = chunk.replace(/^data:\s*/, "");
        try {
          const data = JSON.parse(jsonText);
          if (data.delta) {
            onDelta(String(data.delta));
          }
          if (data.error) {
            throw new Error(data.error);
          }
          if (data.done) {
            return;
          }
        } catch (error) {
          throw error;
        }
      }
      boundary = buffer.indexOf("\n\n");
    }
  }
}

function showNotice(title, message) {
  const toast = document.getElementById("toast");
  const toastTitle = document.getElementById("toastTitle");
  const toastMsg = document.getElementById("toastMsg");

  if (toast && toastTitle && toastMsg) {
    toastTitle.textContent = title;
    toastMsg.innerHTML = message;
    toast.style.display = "block";
    return;
  }

  alert(`${title}\n\n${message.replace(/<[^>]*>/g, "")}`);
}

function redirectToCheckout() {
  if (typeof window.startCheckout === "function") {
    window.startCheckout("associates", "monthly");
    return;
  }

  window.location.href = "/pricing.html";
}

function updateSyncUI(enabled) {
  const syncDot = document.getElementById("syncDot");
  const syncStatus = document.getElementById("syncStatus");
  if (syncDot) {
    syncDot.style.background = enabled ? "#4ade80" : "#ef4444";
  }
  if (syncStatus) {
    syncStatus.textContent = enabled ? "ON" : "OFF";
  }
}

async function fetchCloudHistory() {
  const token = getAuthToken();
  if (!token) return [];
  try {
    const data = await apiFetchJson("/api/history", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(data?.history) ? data.history : [];
  } catch (error) {
    return [];
  }
}

async function syncHistoryToCloud(history) {
  const token = getAuthToken();
  if (!token) return false;
  try {
    await apiFetchJson("/api/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ history })
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function initProfileUI() {
  const planBadge = document.getElementById("planBadge");
  const whoami = document.getElementById("whoami");
  const subBadge = document.getElementById("subBadge");

  const profile = await getProfile();
  const plan = String(profile?.plan || "associates").toUpperCase();

  if (planBadge) {
    planBadge.textContent = plan;
  }
  if (whoami) {
    if (profile?.logged_in) {
      const name = String(profile?.name || "Student");
      const studentId = String(profile?.student_id || "BN-...");
      whoami.textContent = `${name} • ${studentId}`;
    } else {
      whoami.textContent = "Guest • BN-...";
    }
  }

  if (subBadge && profile?.logged_in) {
    try {
      const token = getAuthToken();
      const data = await apiFetchJson("/api/subscription", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const status = String(data?.status || "none").toUpperCase();
      subBadge.textContent = `SUBSCRIPTION: ${status}`;
    } catch (error) {
      subBadge.textContent = "SUBSCRIPTION: NONE";
    }
  }
}

async function canUseChat() {
  const profile = await getProfile();
  if (profile?.logged_in && isPaidPlan(String(profile.plan || "").toLowerCase())) {
    return { allowed: true, isFree: false, profile };
  }

  const used = getFreeChatCount();
  if (used >= FREE_CHAT_LIMIT) {
    return { allowed: false, isFree: true, profile };
  }

  return { allowed: true, isFree: true, profile };
}

function initChat() {
  const messagesEl = document.getElementById("messages");
  const inputEl = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const subjectSelect = document.getElementById("subjectSelect");
  const subjectLabel = document.getElementById("subjectLabel");

  if (!messagesEl || !inputEl || !sendBtn) return;

  let history = loadChatHistory();
  renderHistory(messagesEl, history);

  if (subjectSelect && subjectLabel) {
    subjectLabel.textContent = subjectSelect.value || "General";
    subjectSelect.addEventListener("change", () => {
      subjectLabel.textContent = subjectSelect.value || "General";
    });
  }

  async function refreshFromCloud() {
    if (!getSyncEnabled()) return;
    const profile = await getProfile();
    if (!profile?.logged_in) return;
    const cloudHistory = await fetchCloudHistory();
    if (cloudHistory.length) {
      history = cloudHistory;
      saveChatHistory(history);
      renderHistory(messagesEl, history);
    }
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    const { allowed, isFree, profile } = await canUseChat();
    if (!allowed) {
      showNotice(
        "Free limit reached",
        "You have used all 7 free interactions. <a href=\"/pricing.html\">Upgrade to continue</a>."
      );
      redirectToCheckout();
      return;
    }

    inputEl.value = "";
    appendMessage(messagesEl, "user", text);
    history.push({ role: "user", content: text });
    saveChatHistory(history);

    if (isFree) {
      incrementFreeChatCount();
    }

    const subject = subjectSelect?.value || "General";
    const plan = String(profile?.plan || "associates").toLowerCase();
    const token = getAuthToken();

    const assistantBubble = appendMessage(messagesEl, "assistant", "");
    const typingIndicator = document.createElement("span");
    typingIndicator.className = "typing-indicator";
    typingIndicator.setAttribute("aria-live", "polite");
    typingIndicator.innerHTML =
      "Typing <span class=\"dots\"><span class=\"dot\"></span><span class=\"dot\"></span><span class=\"dot\"></span></span>";
    assistantBubble.appendChild(typingIndicator);
    let assistantText = "";

    try {
      await streamChatReply(
        { message: text, history, subject, plan },
        (delta) => {
          assistantText += delta;
          assistantBubble.textContent = assistantText;
          assistantBubble.appendChild(typingIndicator);
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }
      );

      if (assistantText.trim()) {
        typingIndicator.remove();
        history.push({ role: "assistant", content: assistantText });
        saveChatHistory(history);
        if (getSyncEnabled()) {
          await syncHistoryToCloud(history);
        }
      } else {
        typingIndicator.remove();
        assistantBubble.textContent = "Sorry, I couldn't respond just now. Please try again.";
      }
    } catch (error) {
      typingIndicator.remove();
      assistantBubble.textContent = "Sorry, I couldn't respond just now. Please try again.";
    }
  }

  const resumeBtn = document.getElementById("resumeBtn");
  if (resumeBtn) {
    resumeBtn.addEventListener("click", async () => {
      await refreshFromCloud();
      if (!history.length) {
        showNotice("No saved chat", "Start a conversation to build your chat history.");
      }
    });
  }

  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "botnology-chat.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  }

  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");
  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          history = parsed;
          saveChatHistory(history);
          renderHistory(messagesEl, history);
          if (getSyncEnabled()) {
            await syncHistoryToCloud(history);
          }
        } else {
          showNotice("Import failed", "That file does not look like a chat export.");
        }
      } catch (error) {
        showNotice("Import failed", "Could not read that file.");
      } finally {
        importFile.value = "";
      }
    });
  }

  const syncNow = document.getElementById("syncNow");
  const syncDot = document.getElementById("syncDot");
  const syncStatus = document.getElementById("syncStatus");

  updateSyncUI(getSyncEnabled());

  const toggleSync = async () => {
    const profile = await getProfile();
    if (!profile?.logged_in) {
      showNotice("Sign in required", "Sign in to enable cloud sync.");
      return;
    }
    const next = !getSyncEnabled();
    setSyncEnabled(next);
    updateSyncUI(next);
    if (next) {
      await refreshFromCloud();
      await syncHistoryToCloud(history);
    }
  };

  if (syncDot) {
    syncDot.addEventListener("click", toggleSync);
  }
  if (syncStatus) {
    syncStatus.addEventListener("click", toggleSync);
  }
  if (syncNow) {
    syncNow.addEventListener("click", async () => {
      const profile = await getProfile();
      if (!profile?.logged_in) {
        showNotice("Sign in required", "Sign in to enable cloud sync.");
        return;
      }
      setSyncEnabled(true);
      updateSyncUI(true);
      await refreshFromCloud();
      await syncHistoryToCloud(history);
      showNotice("Cloud sync", "Your chat is synced.");
    });
  }

  refreshFromCloud();

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
}

// ==========================================
// THEME TOGGLE
// ==========================================
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) {
    console.log("Theme toggle button not found");
    return;
  }

  // Load saved theme preference
  const savedTheme = localStorage.getItem("botnology_theme");
  if (savedTheme === "yeti") {
    document.body.classList.add("yeti-theme");
    themeToggle.textContent = "Forest Mode";
  }

  themeToggle.addEventListener("click", () => {
    const isYeti = document.body.classList.toggle("yeti-theme");
    themeToggle.textContent = isYeti ? "Forest Mode" : "Yeti Mode";
    localStorage.setItem("botnology_theme", isYeti ? "yeti" : "forest");
    console.log(`Theme switched to: ${isYeti ? "yeti" : "forest"}`);
  });
}

// ==========================================
// VOICE BUTTON
// ==========================================
function initVoiceButton() {
  const voiceButton = document.getElementById("voice-button");
  if (!voiceButton) return;

  const selectTutorVoice = () => {
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(voice => {
      const name = (voice.name || "").toLowerCase();
      const lang = (voice.lang || "").toLowerCase();
      return lang.startsWith("en-gb") && (name.includes("male") || name.includes("english") || name.includes("uk"));
    });
    if (preferred) return preferred;

    const enGb = voices.find(voice => (voice.lang || "").toLowerCase().startsWith("en-gb"));
    if (enGb) return enGb;

    return voices.find(voice => (voice.lang || "").toLowerCase().startsWith("en")) || voices[0];
  };

  let tutorVoice = selectTutorVoice();
  if (typeof speechSynthesis !== "undefined") {
    speechSynthesis.addEventListener("voiceschanged", () => {
      tutorVoice = selectTutorVoice();
    });
  }

  voiceButton.addEventListener("click", () => {
    const text = "Hello! I am Professor Botonic, your premium AI tutor. Let's learn together!";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = tutorVoice || selectTutorVoice();
    utterance.rate = 0.85;
    utterance.pitch = 0.7;
    speechSynthesis.speak(utterance);
  });
}

// ==========================================
// STRIPE CHECKOUT
// ==========================================
async function startCheckout(plan, cadence) {
  console.log(`Starting checkout for plan: ${plan}, cadence: ${cadence}`);

  if (!plan || !cadence) {
    alert("Invalid plan or cadence selected.");
    return;
  }

  const token = localStorage.getItem("botnology_token");
  let student_id = "BN-UNKNOWN";
  let email = "";

  if (token) {
    try {
      const base64Payload = token.split('.')[1];
      if (!base64Payload) throw new Error("Invalid token format");
      const decodedPayload = atob(base64Payload);
      const payload = JSON.parse(decodedPayload);
      student_id = payload.student_id || "BN-UNKNOWN";
      email = payload.email || "";
      console.log(`Using stored credentials - student_id: ${student_id}, email: ${email}`);
    } catch (e) {
      console.warn("Could not decode or parse token payload:", e);
    }
  } else {
    console.log("No stored token found, proceeding as guest");
  }

  const requestBody = { 
    plan: plan, 
    cadence: cadence,
    student_id: student_id,
    email: email
  };
  console.log("Sending request to /api/stripe/create-checkout-session:", requestBody);

  try {
    const data = await apiFetchJson("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Checkout session response:", data);
    if (data.url) {
      console.log("Redirecting to Stripe checkout:", data.url);
      window.location.href = data.url;
    } else {
      alert("Failed to create checkout session. " + (data.detail || "No URL returned"));
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    alert("An error occurred while opening checkout: " + error.message);
  }
}

// ==========================================
// AUTH MODAL
// ==========================================
function initAuthModal() {
  const authModal = document.getElementById("authModal");
  const openAuth = document.getElementById("openAuth");
  const closeAuth = document.getElementById("closeAuth");
  const doAuth = document.getElementById("doAuth");

  if (!authModal || !openAuth) return;

  openAuth.addEventListener("click", () => {
    authModal.style.display = "flex";
  });

  if (closeAuth) {
    closeAuth.addEventListener("click", () => {
      authModal.style.display = "none";
    });
  }

  if (doAuth) {
    doAuth.addEventListener("click", async () => {
      const name = document.getElementById("authName")?.value.trim() || "Student";
      const email = document.getElementById("authEmail")?.value.trim() || "";
      const plan = "associates";

      if (!email || !email.includes("@")) {
        alert("Please enter a valid email address.");
        return;
      }

      try {
        const data = await apiFetchJson("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, plan })
        });
        localStorage.setItem("botnology_token", data.token);
        cachedProfile = null;
        console.log("Auth successful:", data);
        authModal.style.display = "none";

        const toast = document.getElementById("toast");
        const toastTitle = document.getElementById("toastTitle");
        const toastMsg = document.getElementById("toastMsg");
        if (toast && toastTitle && toastMsg) {
          toastTitle.textContent = "Signed in successfully";
          toastMsg.innerHTML = `Welcome, ${data.name}! You're on the ${data.plan} plan. <a href="/pricing.html">Upgrade your plan</a> anytime.`;
          toast.style.display = "block";
          setTimeout(() => {
            toast.style.display = "none";
          }, 7000);
        }
        
        // Update UI to show signed-in state
        if (openAuth) {
          openAuth.textContent = "Signed In";
          openAuth.classList.remove("gold");
          openAuth.classList.add("mint");
        }
      } catch (error) {
        console.error("Auth error:", error);
        alert("Sign in failed. Please try again.");
      }
    });
  }
}

// ==========================================
// HEALTH CHECK
// ==========================================
async function checkHealth() {
  const healthDot = document.getElementById("healthDot");
  const healthLine = document.getElementById("healthLine");
  
  if (!healthLine) return;

  try {
    const data = await apiFetchJson("/api/health");
    
    if (data.status === "ok") {
      if (healthDot) healthDot.style.background = "#4ade80";
      healthLine.textContent = "API: Online ✓";
      console.log("Health check passed:", data);
    } else {
      if (healthDot) healthDot.style.background = "#fbbf24";
      healthLine.textContent = "API: Degraded";
    }
  } catch (error) {
    if (healthDot) healthDot.style.background = "#ef4444";
    healthLine.textContent = "API: Offline";
    console.error("Health check failed:", error);
  }
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("Botnology 101 initializing...");

  const closeToast = document.getElementById("closeToast");
  const toast = document.getElementById("toast");
  if (closeToast && toast) {
    closeToast.addEventListener("click", () => {
      toast.style.display = "none";
    });
  }
  
  // Initialize all features
  initThemeToggle();
  initVoiceButton();
  initAuthModal();
  initProfileUI();
  initChat();
  checkHealth();
  
  // Check for checkout success/cancel
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutStatus = urlParams.get("checkout");
  
  if (checkoutStatus === "success") {
    const plan = urlParams.get("plan") || "your plan";
    alert(`🎉 Success! Your ${plan} subscription is being processed. You'll receive a confirmation email shortly.`);
  } else if (checkoutStatus === "cancel") {
    alert("Checkout was cancelled. No charges were made.");
  }
  
  console.log("Botnology 101 ready!");
});

// Attach startCheckout to the global window object
window.startCheckout = startCheckout;