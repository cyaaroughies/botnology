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

function appendMessage(messagesEl, role, content) {
  const bubble = document.createElement("div");
  bubble.className = `msg ${role === "user" ? "user" : "assistant"}`;
  bubble.textContent = content;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
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

  const history = loadChatHistory();
  history.forEach(item => {
    if (item && item.role && item.content) {
      appendMessage(messagesEl, item.role, item.content);
    }
  });

  if (subjectSelect && subjectLabel) {
    subjectLabel.textContent = subjectSelect.value || "General";
    subjectSelect.addEventListener("change", () => {
      subjectLabel.textContent = subjectSelect.value || "General";
    });
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
    const token = localStorage.getItem("botnology_token") || "";

    try {
      const data = await apiFetchJson("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: text, history, subject, plan })
      });

      const reply = String(data?.reply || "").trim();
      if (reply) {
        appendMessage(messagesEl, "assistant", reply);
        history.push({ role: "assistant", content: reply });
        saveChatHistory(history);
      }
    } catch (error) {
      appendMessage(messagesEl, "assistant", "Sorry, I couldn't respond just now. Please try again.");
    }
  }

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

  voiceButton.addEventListener("click", () => {
    const text = "Hello! I am Professor Botonic, your premium AI tutor. Let's learn together!";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.name.includes("English"));
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