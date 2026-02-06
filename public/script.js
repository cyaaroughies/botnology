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
      const plan = document.getElementById("authPlan")?.value || "associates";

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
        console.log("Auth successful:", data);
        alert(`Welcome, ${data.name}! You're signed in with ${data.plan} plan.`);
        authModal.style.display = "none";
        
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
  
  // Initialize all features
  initThemeToggle();
  initVoiceButton();
  initAuthModal();
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