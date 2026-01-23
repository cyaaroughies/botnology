// ==========================================
// THEME TOGGLE (Yeti Mode)
// ==========================================
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

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
function startCheckout(plan, cadence) {
  console.log(`Starting checkout for plan: ${plan}, cadence: ${cadence}`);
  
  if (!plan || !cadence) {
    alert("Invalid plan or cadence selected.");
    return;
  }

  // Get auth token from localStorage if available
  const token = localStorage.getItem("botnology_token");
  let student_id = "BN-UNKNOWN";
  let email = "";

  if (token) {
    try {
      // Decode token to get student_id and email
      const payload = JSON.parse(atob(token.split('.')[0]));
      student_id = payload.student_id || "BN-UNKNOWN";
      email = payload.email || "";
      console.log(`Using stored credentials - student_id: ${student_id}, email: ${email}`);
    } catch (e) {
      console.warn("Could not decode token:", e);
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

  fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      console.log(`Received response with status: ${response.status}`);
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Checkout session response:", data);
      if (data.url) {
        console.log("Redirecting to Stripe checkout:", data.url);
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session. " + (data.detail || "No URL returned"));
      }
    })
    .catch((error) => {
      console.error("Error creating checkout session:", error);
      alert("An error occurred while opening checkout: " + error.message);
    });
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
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, plan })
        });

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const data = await response.json();
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
    const response = await fetch("/api/health");
    const data = await response.json();
    
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
