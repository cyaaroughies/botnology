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
  });
}

// ==========================================
// VOICE BUTTON
// ==========================================
function initVoiceButton() {
  const voiceButton = document.getElementById("voice-button");
  if (!voiceButton) return;

  voiceButton.addEventListener("click", () => {
    const text = "Good afternoon. I am Professor Botonic, your premium AI tutor from Harvard. Jolly good to make your acquaintance. Shall we embark on a spot of learning together?";
    const utterance = new SpeechSynthesisUtterance(text);

    // Wait for voices to load
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      // Try to find a British English voice
      const britishVoice = voices.find(v => v.lang === "en-GB");
      if (britishVoice) utterance.voice = britishVoice;
    };

    speechSynthesis.addEventListener("voiceschanged", setVoice);
    setVoice();
    speechSynthesis.speak(utterance);
  });
}

// Initialize voice button on page load
document.addEventListener('DOMContentLoaded', initVoiceButton);

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
    const fetchResponse = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Received response with status: ${fetchResponse.status}`);

    if (!fetchResponse.ok) {
      const contentType = fetchResponse.headers.get("Content-Type") || "";
      let errorBody;
      if (contentType.includes("application/json")) {
        errorBody = await fetchResponse.json();
      } else {
        errorBody = await fetchResponse.text();
      }
      console.error("Error response from server:", errorBody);
      throw new Error(errorBody.detail || errorBody || `HTTP ${fetchResponse.status}`);
    }

    const textResponse = await fetchResponse.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      console.warn("Response is not valid JSON, returning as plain text.");
      data = { detail: textResponse };
    }

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

      console.log("Auth payload:", { name, email, plan }); // Debug log for payload

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

        console.log("Auth response:", response); // Debug log for response

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const data = await response.json();
        console.log("Auth success data:", data); // Debug log for success data

        localStorage.setItem("botnology_token", data.token);
        alert(`Welcome, ${data.name}! You're signed in with ${data.plan} plan.`);
        authModal.style.display = "none";

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
// STUDENT DESKTOP FEATURES
// ==========================================
function initStudentDesktop() {
  const coffeeBtn = document.getElementById("coffeeBtn");
  const penBtn = document.getElementById("penBtn");
  const paperBtn = document.getElementById("paperBtn");
  const fsSearch = document.getElementById("fsSearch");
  const fsRefresh = document.getElementById("fsRefresh");
  const fsTree = document.getElementById("fsTree");
  const fsPath = document.getElementById("fsPath");

  if (coffeeBtn) {
    coffeeBtn.addEventListener("click", () => {
      alert("Enjoy your coffee! ☕");
    });
  } else {
    console.warn("Coffee button not found.");
  }

  if (penBtn) {
    penBtn.addEventListener("click", () => {
      alert("Here's your pen! ✒️");
    });
  } else {
    console.warn("Pen button not found.");
  }

  if (paperBtn) {
    paperBtn.addEventListener("click", () => {
      alert("Here's some paper! 📄");
    });
  } else {
    console.warn("Paper button not found.");
  }

  if (fsSearch) {
    fsSearch.addEventListener("input", (event) => {
      const query = event.target.value.toLowerCase();
      console.log(`Filtering files with query: ${query}`);
      // Implement file filtering logic here
    });
  }

  if (fsRefresh) {
    fsRefresh.addEventListener("click", () => {
      console.log("Refreshing file system view...");
      // Implement refresh logic here
    });
  }

  if (fsTree) {
    console.log("File system tree initialized.");
    // Implement file system tree rendering logic here
  }

  if (fsPath) {
    fsPath.addEventListener("change", (event) => {
      const path = event.target.value;
      console.log(`Path updated to: ${path}`);
      // Implement path update logic here
    });
  }
}

// Delay student desktop initialization to ensure DOM is fully loaded
window.addEventListener("load", initStudentDesktop);

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("Botnology 101 initializing...");
  
  // Initialize all features
  initThemeToggle();
  initVoiceButton();
  initStudentDesktop();
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

// Chat System for Index Page
let chatMessages = [];

function initializeChat() {
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');

  if (!sendBtn || !chatInput) {
    console.error('Chat elements not found on the page.');
    return;
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  addWelcomeMessage();
}

function addWelcomeMessage() {
  const welcome = {
    role: 'assistant',
    content: `Welcome! I'm Professor Botnotic. How can I assist you today?`
  };

  chatMessages = [welcome];
  renderMessages();
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();

  if (!text) return;

  chatMessages.push({ role: 'user', content: text });
  renderMessages();
  input.value = '';

  // Simulate assistant response
  setTimeout(() => {
    chatMessages.push({ role: 'assistant', content: 'Let me think about that...' });
    renderMessages();
  }, 1000);
}

function renderMessages() {
  const container = document.getElementById('messages');
  if (!container) {
    console.error('Messages container not found.');
    return;
  }

  container.innerHTML = '';

  chatMessages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg msg-${msg.role}`;

    const label = msg.role === 'user' ? 'You' : 'Professor Botnotic';

    msgDiv.innerHTML = `
      <div class="msg-label">${label}</div>
      <div class="msg-text">${msg.content}</div>
    `;

    container.appendChild(msgDiv);
  });

  container.scrollTop = container.scrollHeight;
}

// Initialize chat on page load
document.addEventListener('DOMContentLoaded', initializeChat);

// Button Handlers for Chat Panel
function initializeChatButtons() {
  const resumeBtn = document.getElementById('resumeBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const syncNow = document.getElementById('syncNow');
  const openBadge = document.getElementById('openBadge');
  const startNewChat = document.getElementById('startNewChat');

  // Resume last chat
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      if (chatMessages.length > 0) {
        alert('Resuming last chat...');
      } else {
        alert('No previous chat to resume.');
      }
    });
  }

  // Export chat
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(chatMessages, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Import chat
  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedMessages = JSON.parse(event.target.result);
            chatMessages = importedMessages;
            renderMessages();
            alert('Chat history imported successfully.');
          } catch (err) {
            alert('Failed to import chat history. Invalid file format.');
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // Sync Now
  if (syncNow) {
    syncNow.addEventListener('click', () => {
      alert('Syncing data to the cloud...');
      // Add sync logic here
    });
  }

  // Open Badge
  if (openBadge) {
    openBadge.addEventListener('click', () => {
      alert('Opening badge update modal...');
      // Add badge update logic here
    });
  }

  // Start New Chat
  if (startNewChat) {
    startNewChat.addEventListener('click', () => {
      chatMessages = [];
      renderMessages();
      alert('Started a new chat session.');
    });
  }
}

// Initialize buttons on page load
document.addEventListener('DOMContentLoaded', initializeChatButtons);

// Temporary debug logs for student desktop buttons
console.log("Initializing student desktop...");
const coffeeBtn = document.getElementById("coffeeBtn");
const penBtn = document.getElementById("penBtn");
const paperBtn = document.getElementById("paperBtn");

if (!coffeeBtn) console.warn("Coffee button not found.");
if (!penBtn) console.warn("Pen button not found.");
if (!paperBtn) console.warn("Paper button not found.");
