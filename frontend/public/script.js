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
const ADMIN_PASSPHRASE = "Soxy2026";
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

function initAdminReset() {
  const buttons = document.querySelectorAll("#adminResetBtn");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.style.display = "inline-flex";
    button.addEventListener("click", () => {
      const isAdmin = localStorage.getItem("botnology_admin") === "true";
      if (!isAdmin) {
        const entered = window.prompt("Admin passphrase:", "");
        if (!entered || entered !== ADMIN_PASSPHRASE) {
          showNotice("Access denied", "Admin passphrase required.");
          return;
        }
        localStorage.setItem("botnology_admin", "true");
      }

      localStorage.setItem(FREE_CHAT_COUNT_KEY, "0");
      showNotice("Free chats reset", "Free interactions have been reset for this browser.");
    });
  });
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

  if (subBadge) {
    if (profile?.logged_in) {
      try {
        const token = getAuthToken();
        const data = await apiFetchJson("/api/subscription", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const status = String(data?.status || "none").toUpperCase();
        subBadge.textContent = `SUBSCRIPTION: ${status}`;
        
        // Update badge styling based on status
        subBadge.className = "badge";
        if (status === "ACTIVE") {
          subBadge.classList.add("badge-active");
        } else if (status === "TRIALING") {
          subBadge.classList.add("badge-trialing");
        } else {
          subBadge.classList.add("badge-none");
        }
        
        // Make it clickable if no subscription
        if (status === "NONE") {
          subBadge.style.cursor = "pointer";
          subBadge.title = "Click to view subscription plans";
          subBadge.onclick = () => window.location.href = "/pricing.html";
        }
      } catch (error) {
        console.error("Failed to fetch subscription status:", error);
        subBadge.textContent = "SUBSCRIPTION: NONE";
        subBadge.className = "badge badge-none";
        subBadge.style.cursor = "pointer";
        subBadge.title = "Click to view subscription plans";
        subBadge.onclick = () => window.location.href = "/pricing.html";
      }
    } else {
      subBadge.textContent = "SUBSCRIPTION: NONE";
      subBadge.className = "badge badge-none";
      subBadge.style.cursor = "pointer";
      subBadge.title = "Sign in and subscribe to upgrade";
      subBadge.onclick = () => window.location.href = "/pricing.html";
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

      if (!assistantText.trim()) {
        throw new Error("Empty stream response");
      }
    } catch (error) {
      try {
        const data = await apiFetchJson("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ message: text, history, subject, plan })
        });
        assistantText = String(data?.reply || "").trim();
        assistantBubble.textContent = assistantText;
      } catch (fallbackError) {
        assistantBubble.textContent = "Sorry, I couldn't respond just now. Please try again.";
      }
    }

    typingIndicator.remove();
    if (assistantText.trim()) {
      history.push({ role: "assistant", content: assistantText });
      saveChatHistory(history);
      if (getSyncEnabled()) {
        await syncHistoryToCloud(history);
      }
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
      return lang.startsWith("en-gb") && (name.includes("male") || name.includes("london") || name.includes("british") || name.includes("english") || name.includes("uk"));
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
    const text = "Hello! I am Dr. Botnotic, your premium AI tutor. Let's learn together!";
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
// BADGE MODAL (ID PHOTO)
// ==========================================
function initBadgeModal() {
  const badgeModal = document.getElementById("badgeModal");
  const openBadge = document.getElementById("openBadge");
  const closeBadge = document.getElementById("closeBadge");
  const badgeFile = document.getElementById("badgeFile");
  const cropBox = document.getElementById("cropBox");
  const cropImg = document.getElementById("cropImg");
  const cropZoom = document.getElementById("cropZoom");
  const cropReset = document.getElementById("cropReset");
  const shapeCircle = document.getElementById("shapeCircle");
  const shapeSquare = document.getElementById("shapeSquare");
  const saveBadgePhoto = document.getElementById("saveBadgePhoto");
  const badgePhoto = document.getElementById("badgePhoto");
  const cropFormat = document.getElementById("cropFormat");
  const cropQuality = document.getElementById("cropQuality");
  const cropSize = document.getElementById("cropSize");
  const exportPreview = document.getElementById("exportPreview");

  if (!badgeModal || !openBadge) return;

  let dragState = { isDragging: false, startX: 0, startY: 0, currentX: 0, currentY: 0 };
  let currentZoom = 1;
  let currentShape = "circle";
  let uploadedImageSrc = null;

  // Update export preview text
  function updateExportPreview() {
    if (!exportPreview) return;
    const format = cropFormat?.value || "jpeg";
    const size = cropSize?.value || "1024";
    const quality = Math.round((parseFloat(cropQuality?.value || "0.90")) * 100);
    exportPreview.textContent = `Output: ${size}×${size} ${format.toUpperCase()}${format === "jpeg" ? ` (${quality}%)` : ""}`;
  }

  // Open modal
  openBadge.addEventListener("click", () => {
    badgeModal.style.display = "flex";
  });

  // Close modal
  if (closeBadge) {
    closeBadge.addEventListener("click", () => {
      badgeModal.style.display = "none";
    });
  }

  // Close on background click
  badgeModal.addEventListener("click", (e) => {
    if (e.target === badgeModal) {
      badgeModal.style.display = "none";
    }
  });

  // Shape toggle
  if (shapeCircle && shapeSquare) {
    shapeCircle.classList.add("active");
    
    shapeCircle.addEventListener("click", () => {
      currentShape = "circle";
      cropBox.style.borderRadius = "999px";
      shapeCircle.classList.add("active");
      shapeSquare.classList.remove("active");
    });

    shapeSquare.addEventListener("click", () => {
      currentShape = "square";
      cropBox.style.borderRadius = "12px";
      shapeSquare.classList.add("active");
      shapeCircle.classList.remove("active");
    });
  }

  // File upload
  if (badgeFile) {
    badgeFile.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedImageSrc = event.target.result;
        cropImg.src = uploadedImageSrc;
        dragState.currentX = 0;
        dragState.currentY = 0;
        currentZoom = 1;
        if (cropZoom) cropZoom.value = "1";
        updateTransform();
      };
      reader.readAsDataURL(file);
    });
  }

  // Zoom control
  if (cropZoom) {
    cropZoom.addEventListener("input", (e) => {
      currentZoom = parseFloat(e.target.value);
      updateTransform();
    });
  }

  // Export preview updates
  if (cropFormat) {
    cropFormat.addEventListener("change", updateExportPreview);
  }
  if (cropQuality) {
    cropQuality.addEventListener("input", updateExportPreview);
  }
  if (cropSize) {
    cropSize.addEventListener("change", updateExportPreview);
  }

  // Drag functionality
  if (cropBox && cropImg) {
    cropBox.addEventListener("mousedown", (e) => {
      dragState.isDragging = true;
      dragState.startX = e.clientX - dragState.currentX;
      dragState.startY = e.clientY - dragState.currentY;
      cropBox.classList.add("drag");
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragState.isDragging) return;
      dragState.currentX = e.clientX - dragState.startX;
      dragState.currentY = e.clientY - dragState.startY;
      updateTransform();
    });

    document.addEventListener("mouseup", () => {
      if (dragState.isDragging) {
        dragState.isDragging = false;
        cropBox.classList.remove("drag");
      }
    });

    // Touch support
    cropBox.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      dragState.isDragging = true;
      dragState.startX = touch.clientX - dragState.currentX;
      dragState.startY = touch.clientY - dragState.currentY;
      cropBox.classList.add("drag");
      e.preventDefault();
    });

    document.addEventListener("touchmove", (e) => {
      if (!dragState.isDragging) return;
      const touch = e.touches[0];
      dragState.currentX = touch.clientX - dragState.startX;
      dragState.currentY = touch.clientY - dragState.startY;
      updateTransform();
    });

    document.addEventListener("touchend", () => {
      if (dragState.isDragging) {
        dragState.isDragging = false;
        cropBox.classList.remove("drag");
      }
    });
  }

  function updateTransform() {
    if (!cropImg) return;
    cropImg.style.transform = `translate(calc(-50% + ${dragState.currentX}px), calc(-50% + ${dragState.currentY}px)) scale(${currentZoom})`;
  }

  // Reset
  if (cropReset) {
    cropReset.addEventListener("click", () => {
      dragState.currentX = 0;
      dragState.currentY = 0;
      currentZoom = 1;
      if (cropZoom) cropZoom.value = "1";
      updateTransform();
    });
  }

  // Save photo
  if (saveBadgePhoto) {
    saveBadgePhoto.addEventListener("click", () => {
      const size = parseInt(cropSize?.value || "1024");
      const format = cropFormat?.value || "jpeg";
      const quality = parseFloat(cropQuality?.value || "0.90");

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // Get crop box dimensions
      const boxRect = cropBox.getBoundingClientRect();
      const imgRect = cropImg.getBoundingClientRect();

      // Calculate scale factor
      const scaleFactor = size / boxRect.width;

      // Calculate image position relative to crop box
      const offsetX = (imgRect.left - boxRect.left) * scaleFactor;
      const offsetY = (imgRect.top - boxRect.top) * scaleFactor;
      const imgWidth = imgRect.width * scaleFactor;
      const imgHeight = imgRect.height * scaleFactor;

      // Draw image
      const img = new Image();
      img.onload = () => {
        // Clear canvas with transparency
        ctx.clearRect(0, 0, size, size);
        
        // Draw image
        ctx.drawImage(img, offsetX, offsetY, imgWidth, imgHeight);

        // Convert to data URL
        const dataUrl = canvas.toDataURL(`image/${format}`, quality);

        // Update badge photo
        if (badgePhoto) {
          badgePhoto.src = dataUrl;
          // Match shape
          if (currentShape === "square") {
            badgePhoto.style.borderRadius = "12px";
          } else {
            badgePhoto.style.borderRadius = "999px";
          }
        }

        // Save to localStorage
        try {
          localStorage.setItem("botnology_badge_photo", dataUrl);
          localStorage.setItem("botnology_badge_shape", currentShape);
        } catch (e) {
          console.warn("Failed to save photo to localStorage:", e);
        }

        // Close modal
        badgeModal.style.display = "none";
        alert("✅ Badge photo updated!");
      };
      img.src = cropImg.src;
    });
  }

  // Load saved photo on init
  try {
    const savedPhoto = localStorage.getItem("botnology_badge_photo");
    const savedShape = localStorage.getItem("botnology_badge_shape");
    if (savedPhoto && badgePhoto) {
      badgePhoto.src = savedPhoto;
      if (savedShape === "square") {
        badgePhoto.style.borderRadius = "12px";
      }
    }
  } catch (e) {
    console.warn("Failed to load saved photo:", e);
  }

  // Initialize export preview
  updateExportPreview();
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
// STUDENT FILE SYSTEM
// ==========================================
function initFileSystem() {
  const fsTree = document.getElementById("fsTree");
  const fsPath = document.getElementById("fsPath");
  const fsEditor = document.getElementById("fsEditor");
  const fsRefresh = document.getElementById("fsRefresh");
  const fsSave = document.getElementById("fsSave");
  const fsNewFile = document.getElementById("fsNewFile");
  const fsNewFolder = document.getElementById("fsNewFolder");
  const fsDelete = document.getElementById("fsDelete");
  const fsDownload = document.getElementById("fsDownload");
  const fsSearch = document.getElementById("fsSearch");

  if (!fsTree) return;

  // Get file system from localStorage
  function getFileSystem() {
    try {
      const fs = localStorage.getItem("botnology_filesystem");
      return fs ? JSON.parse(fs) : {
        "notes/": { type: "folder" },
        "notes/welcome.txt": { type: "file", content: "Welcome to your Student Desktop!\n\nUse this space to organize your study materials, notes, and assignments.\n\nTips:\n- Create folders to organize your files\n- Click any file to edit it\n- All changes are saved automatically" },
        "assignments/": { type: "folder" },
        "assignments/todo.txt": { type: "file", content: "My Assignments:\n\n[ ] Complete reading for Chapter 3\n[ ] Practice problems 1-10\n[ ] Review lecture notes" }
      };
    } catch (e) {
      console.error("Error loading file system:", e);
      return {};
    }
  }

  // Save file system to localStorage
  function saveFileSystem(fs) {
    try {
      localStorage.setItem("botnology_filesystem", JSON.stringify(fs));
    } catch (e) {
      console.error("Error saving file system:", e);
      alert("⚠️ Error saving file system. Storage may be full.");
    }
  }

  // Render file tree
  function renderTree(searchTerm = "") {
    const fs = getFileSystem();
    const paths = Object.keys(fs).sort();
    
    let html = '<div style="font-family:monospace;font-size:13px;line-height:1.8">';
    
    // Group by folders
    const folders = paths.filter(p => p.endsWith("/"));
    const files = paths.filter(p => !p.endsWith("/"));
    
    if (folders.length === 0 && files.length === 0) {
      html += '<div style="color:var(--muted);padding:8px">No files yet. Click "New File" to start.</div>';
    } else {
      // Show folders
      folders.forEach(folder => {
        if (searchTerm && !folder.toLowerCase().includes(searchTerm.toLowerCase())) return;
        html += `<div style="padding:4px 8px;cursor:pointer;border-radius:6px;display:flex;align-items:center;gap:6px" 
                      onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                      onmouseout="this.style.background='transparent'"
                      onclick="document.getElementById('fsPath').value='${folder.replace(/'/g, "\\'")}'; document.getElementById('fsEditor').value=''; document.getElementById('fsPath').focus();">
          <span style="color:var(--calm-gold)">📁</span> ${folder}
        </div>`;
      });
      
      // Show files
      files.forEach(file => {
        if (searchTerm && !file.toLowerCase().includes(searchTerm.toLowerCase())) return;
        const icon = file.endsWith(".txt") ? "📄" : file.endsWith(".md") ? "📝" : "📋";
        html += `<div style="padding:4px 8px;cursor:pointer;border-radius:6px;display:flex;align-items:center;gap:6px" 
                      onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                      onmouseout="this.style.background='transparent'"
                      onclick="loadFile('${file.replace(/'/g, "\\'")}')">
          <span>${icon}</span> ${file}
        </div>`;
      });
    }
    
    html += '</div>';
    fsTree.innerHTML = html;
  }

  // Load file into editor
  window.loadFile = function(path) {
    const fs = getFileSystem();
    if (fs[path] && fs[path].type === "file") {
      fsPath.value = path;
      fsEditor.value = fs[path].content || "";
      fsEditor.focus();
    }
  };

  // Save file
  if (fsSave) {
    fsSave.addEventListener("click", () => {
      const path = fsPath.value.trim();
      if (!path) {
        alert("⚠️ Please enter a file path");
        return;
      }
      if (path.endsWith("/")) {
        alert("⚠️ Cannot save a folder. Remove the trailing slash to save as a file.");
        return;
      }

      const fs = getFileSystem();
      fs[path] = { type: "file", content: fsEditor.value };
      saveFileSystem(fs);
      renderTree();
      alert("✅ File saved: " + path);
    });
  }

  // New file
  if (fsNewFile) {
    fsNewFile.addEventListener("click", () => {
      const filename = prompt("Enter file name (e.g., notes.txt or homework/essay.md):");
      if (!filename) return;
      
      const path = filename.trim();
      if (path.endsWith("/")) {
        alert("⚠️ File names cannot end with /");
        return;
      }

      const fs = getFileSystem();
      fs[path] = { type: "file", content: "" };
      saveFileSystem(fs);
      renderTree();
      loadFile(path);
    });
  }

  // New folder
  if (fsNewFolder) {
    fsNewFolder.addEventListener("click", () => {
      let foldername = prompt("Enter folder name (e.g., homework/):");
      if (!foldername) return;
      
      foldername = foldername.trim();
      if (!foldername.endsWith("/")) foldername += "/";

      const fs = getFileSystem();
      fs[foldername] = { type: "folder" };
      saveFileSystem(fs);
      renderTree();
      alert("✅ Folder created: " + foldername);
    });
  }

  // Delete file/folder
  if (fsDelete) {
    fsDelete.addEventListener("click", () => {
      const path = fsPath.value.trim();
      if (!path) {
        alert("⚠️ Please enter a file or folder path to delete");
        return;
      }

      if (!confirm(`Delete "${path}"?`)) return;

      const fs = getFileSystem();
      
      // If deleting folder, also delete all files inside
      if (path.endsWith("/")) {
        Object.keys(fs).forEach(key => {
          if (key.startsWith(path)) {
            delete fs[key];
          }
        });
      } else {
        delete fs[path];
      }
      
      saveFileSystem(fs);
      renderTree();
      fsPath.value = "";
      fsEditor.value = "";
      alert("✅ Deleted: " + path);
    });
  }

  // Download file
  if (fsDownload) {
    fsDownload.addEventListener("click", () => {
      const path = fsPath.value.trim();
      if (!path || path.endsWith("/")) {
        alert("⚠️ Please select a file to download");
        return;
      }

      const fs = getFileSystem();
      if (!fs[path] || fs[path].type !== "file") {
        alert("⚠️ File not found");
        return;
      }

      const content = fs[path].content || "";
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = path.split("/").pop();
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Search/filter
  if (fsSearch) {
    fsSearch.addEventListener("input", (e) => {
      renderTree(e.target.value);
    });
  }

  // Refresh
  if (fsRefresh) {
    fsRefresh.addEventListener("click", () => {
      renderTree();
      alert("✅ File list refreshed");
    });
  }

  // Initial render
  renderTree();
}

// ==========================================
// QUIZ GENERATION
// ==========================================
function initQuizzes() {
  const quizGenerate = document.getElementById("quizGenerate");
  const quizGrade = document.getElementById("quizGrade");
  const quizTopic = document.getElementById("quizTopic");
  const quizLevel = document.getElementById("quizLevel");
  const quizCount = document.getElementById("quizCount");
  const quizMode = document.getElementById("quizMode");
  const quizList = document.getElementById("quizList");
  const quizScore = document.getElementById("quizScore");
  const quizSave = document.getElementById("quizSave");
  const quizLoadLast = document.getElementById("quizLoadLast");

  if (!quizGenerate) return;

  let currentQuiz = [];

  // Generate quiz
  quizGenerate.addEventListener("click", async () => {
    const topic = quizTopic?.value.trim();
    if (!topic) {
      alert("⚠️ Please enter a topic for the quiz");
      return;
    }

    const level = quizLevel?.value || "bachelors";
    const count = parseInt(quizCount?.value || "5");
    const mode = quizMode?.value || "short";

    quizGenerate.disabled = true;
    quizGenerate.textContent = "Generating...";

    try {
      // Get profile for plan info
      const profile = JSON.parse(localStorage.getItem("botnology_profile") || "{}");
      const userPlan = profile.plan || "associates";
      
      const prompt = mode === "mc" 
        ? `Generate exactly ${count} multiple choice questions about ${topic} at ${level} level. Format each question like this:

Q: What is the question text here?
A) First option
B) Second option
C) Third option
D) Fourth option
Correct: A

Make sure each question follows this exact format.`
        : `Generate exactly ${count} short answer questions about ${topic} at ${level} level. Format each question like this:

Q: What is the question text here?
A: Brief sample answer here

Make sure each question follows this exact format with Q: and A: on separate lines.`;

      console.log("Requesting quiz from API...", { topic, level, count, mode });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          subject: topic,
          plan: userPlan,
          history: []
        })
      });

      console.log("Quiz API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Quiz API error:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Quiz API response data:", data);
      
      const content = data.reply || "";
      
      // Check if we got demo mode response
      if (content.includes("(Demo)")) {
        alert("⚠️ Quiz generation requires OpenAI API to be configured.\n\nDemo mode detected - AI is not available.\n\nPlease contact the administrator to enable AI features.");
        return;
      }

      // Parse the questions
      currentQuiz = [];
      const lines = content.split("\n");
      let currentQ = null;

      lines.forEach(line => {
        line = line.trim();
        if (line.startsWith("Q:") || line.match(/^\d+\./)) {
          if (currentQ) currentQuiz.push(currentQ);
          // Handle "Q:" or numbered questions like "1."
          const questionText = line.replace(/^(Q:|^\d+\.)\s*/, "").trim();
          currentQ = { question: questionText, answer: "", userAnswer: "" };
        } else if (line.startsWith("A:") && currentQ) {
          currentQ.answer = line.substring(2).trim();
        } else if (line.startsWith("Correct:") && currentQ) {
          currentQ.correct = line.substring(8).trim();
        } else if (currentQ && (line.startsWith("A)") || line.startsWith("B)") || line.startsWith("C)") || line.startsWith("D)"))) {
          if (!currentQ.options) currentQ.options = [];
          currentQ.options.push(line);
        }
      });
      if (currentQ) currentQuiz.push(currentQ);

      console.log("Parsed questions:", currentQuiz.length);

      if (currentQuiz.length === 0) {
        alert("⚠️ Failed to parse questions from AI response.\n\nTry again or adjust your topic.");
        console.log("AI response that failed to parse:", content);
        return;
      }

      renderQuiz();
      alert(`✅ Generated ${currentQuiz.length} questions!`);

    } catch (error) {
      console.error("Quiz generation error:", error);
      alert(`⚠️ Failed to generate quiz.\n\nError: ${error.message}\n\nCheck the console for details or try again.`);
    } finally {
      quizGenerate.disabled = false;
      quizGenerate.textContent = "✨ Generate Quiz";
    }
  });

  // Render quiz
  function renderQuiz() {
    if (!quizList) return;
    
    let html = "";
    currentQuiz.forEach((q, i) => {
      html += `<tr>
        <td style="vertical-align:top">${i + 1}. ${q.question}</td>
        <td><input type="text" class="input" id="quizAnswer${i}" placeholder="Your answer..." value="${q.userAnswer || ""}" style="width:100%;padding:6px 8px"/></td>
      </tr>`;
    });
    
    quizList.innerHTML = html || '<tr><td colspan="2" style="text-align:center;color:var(--muted)">No questions yet. Click "Generate" to create a quiz.</td></tr>';
  }

  // Grade quiz
  if (quizGrade) {
    quizGrade.addEventListener("click", () => {
      if (currentQuiz.length === 0) {
        alert("⚠️ Generate a quiz first!");
        return;
      }

      let correct = 0;
      currentQuiz.forEach((q, i) => {
        const input = document.getElementById(`quizAnswer${i}`);
        if (input) {
          q.userAnswer = input.value.trim();
          // Simple grading - check if answer contains key words from correct answer
          const userWords = q.userAnswer.toLowerCase().split(/\s+/);
          const answerWords = q.answer.toLowerCase().split(/\s+/);
          const matches = userWords.filter(w => answerWords.includes(w) && w.length > 3);
          if (matches.length >= Math.min(2, answerWords.length / 2)) {
            correct++;
          }
        }
      });

      const score = Math.round((correct / currentQuiz.length) * 100);
      if (quizScore) {
        quizScore.textContent = `Score: ${correct} / ${currentQuiz.length} (${score}%)`;
        quizScore.style.color = score >= 70 ? "var(--calm-green)" : score >= 50 ? "var(--calm-gold)" : "#ff6b6b";
      }

      alert(`📊 Quiz Result:\n\n${correct} / ${currentQuiz.length} correct (${score}%)\n\n${score >= 70 ? "Great job! 🎉" : score >= 50 ? "Good effort! Keep studying. 📚" : "Keep practicing! You'll get there. 💪"}`);
    });
  }

  // Save quiz
  if (quizSave) {
    quizSave.addEventListener("click", () => {
      if (currentQuiz.length === 0) {
        alert("⚠️ No quiz to save!");
        return;
      }

      try {
        localStorage.setItem("botnology_last_quiz", JSON.stringify(currentQuiz));
        alert("✅ Quiz saved! Use 'Load Last Set' to restore it.");
      } catch (e) {
        console.error("Error saving quiz:", e);
        alert("⚠️ Failed to save quiz");
      }
    });
  }

  // Load last quiz
  if (quizLoadLast) {
    quizLoadLast.addEventListener("click", () => {
      try {
        const saved = localStorage.getItem("botnology_last_quiz");
        if (!saved) {
          alert("⚠️ No saved quiz found");
          return;
        }

        currentQuiz = JSON.parse(saved);
        renderQuiz();
        alert(`✅ Loaded quiz with ${currentQuiz.length} questions`);
      } catch (e) {
        console.error("Error loading quiz:", e);
        alert("⚠️ Failed to load quiz");
      }
    });
  }

  // Initial render
  renderQuiz();
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
  initBadgeModal();
  initAuthModal();
  initProfileUI();
  initChat();
  initFileSystem();
  initQuizzes();
  initAdminReset();
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