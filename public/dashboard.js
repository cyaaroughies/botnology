// ==========================================
// DASHBOARD CHAT FUNCTIONALITY
// ==========================================

let chatHistory = [];
let currentPlan = 'associates'; // Default plan

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard initializing...");
  
  // Load user data from token
  const token = localStorage.getItem("botnology_token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentPlan = payload.plan || 'associates';
      document.getElementById('whoami').textContent = `${payload.name || 'Student'} • ${payload.student_id || 'BN-UNKNOWN'}`;
      document.getElementById('planBadge').textContent = currentPlan.toUpperCase();
      document.getElementById('badgePlan').textContent = currentPlan.toUpperCase();
      document.getElementById('badgeName').textContent = payload.name || 'Student';
      document.getElementById('badgeId').textContent = payload.student_id || 'BN-UNKNOWN';
    } catch (e) {
      console.warn("Could not parse token:", e);
    }
  }
  
  // Load chat history from localStorage
  const savedHistory = localStorage.getItem(`botnology_chat_${currentPlan}`);
  if (savedHistory) {
    try {
      chatHistory = JSON.parse(savedHistory);
      displayHistory();
    } catch (e) {
      console.warn("Could not load chat history:", e);
    }
  }
  
  // Initialize chat
  initChat();
  initThemeToggle();
  checkHealth();
  
  // Add welcome message if no history
  if (chatHistory.length === 0) {
    addWelcomeMessage();
  }
});

function initChat() {
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');
  const resumeBtn = document.getElementById('resumeBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  
  if (!sendBtn || !chatInput) return;
  
  // Send message on button click
  sendBtn.addEventListener('click', () => sendMessage());
  
  // Send message on Enter (Shift+Enter for new line)
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Resume last chat
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      if (chatHistory.length > 0) {
        chatInput.focus();
      } else {
        alert('No previous chat to resume.');
      }
    });
  }
  
  // Export chat
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportChat());
  }
  
  // Import chat
  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => importChat(e));
  }
}

function addWelcomeMessage() {
  const messages = {
    associates: "Good day. I'm Professor Botonic, your AI tutor. Ask me anything to begin your studies.",
    bachelors: "Welcome, dear student. I'm Professor Botonic from Harvard. Let us embark on a journey of deeper understanding together. What shall we explore today?",
    masters: "Greetings, my distinguished scholar. I am Professor Botonic, and it is an honour to mentor you. With my elite guidance, we shall achieve intellectual excellence. What complex matter shall we tackle?"
  };
  
  const welcomeMsg = messages[currentPlan] || messages.associates;
  addMessage('assistant', welcomeMsg);
}

async function sendMessage() {
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const message = chatInput.value.trim();
  
  if (!message) return;
  
  // Add user message to UI
  addMessage('user', message);
  chatInput.value = '';
  sendBtn.disabled = true;
  sendBtn.textContent = 'Thinking...';
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        history: chatHistory,
        plan: currentPlan,
        subject: 'General'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    addMessage('assistant', data.reply);
    
  } catch (error) {
    console.error('Chat error:', error);
    addMessage('assistant', '❌ I apologize, but I encountered a technical difficulty. Please try again.');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
    chatInput.focus();
  }
}

function addMessage(role, content) {
  const messagesDiv = document.getElementById('messages');
  if (!messagesDiv) return;
  
  // Add to history
  chatHistory.push({ role, content });
  
  // Save to localStorage
  localStorage.setItem(`botnology_chat_${currentPlan}`, JSON.stringify(chatHistory));
  
  // Create message element
  const msgDiv = document.createElement('div');
  msgDiv.className = role === 'user' ? 'msg-user' : 'msg-assistant';
  
  const label = document.createElement('div');
  label.className = 'msg-label';
  label.textContent = role === 'user' ? 'You' : 'Dr. Botonic';
  
  const text = document.createElement('div');
  text.className = 'msg-text';
  text.textContent = content;
  
  msgDiv.appendChild(label);
  msgDiv.appendChild(text);
  messagesDiv.appendChild(msgDiv);
  
  // Scroll to bottom
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function displayHistory() {
  const messagesDiv = document.getElementById('messages');
  if (!messagesDiv) return;
  
  messagesDiv.innerHTML = '';
  chatHistory.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = msg.role === 'user' ? 'msg-user' : 'msg-assistant';
    
    const label = document.createElement('div');
    label.className = 'msg-label';
    label.textContent = msg.role === 'user' ? 'You' : 'Dr. Botonic';
    
    const text = document.createElement('div');
    text.className = 'msg-text';
    text.textContent = msg.content;
    
    msgDiv.appendChild(label);
    msgDiv.appendChild(text);
    messagesDiv.appendChild(msgDiv);
  });
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function exportChat() {
  if (chatHistory.length === 0) {
    alert('No chat history to export.');
    return;
  }
  
  const dataStr = JSON.stringify(chatHistory, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `botnology-chat-${currentPlan}-${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

function importChat(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        chatHistory = imported;
        localStorage.setItem(`botnology_chat_${currentPlan}`, JSON.stringify(chatHistory));
        displayHistory();
        alert('Chat history imported successfully!');
      } else {
        alert('Invalid chat file format.');
      }
    } catch (error) {
      alert('Error importing chat: ' + error.message);
    }
  };
  reader.readAsText(file);
}

function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

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

async function checkHealth() {
  const healthLine = document.getElementById("healthLine");
  if (!healthLine) return;

  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    
    if (data.status === "ok") {
      healthLine.textContent = "API: Online ✓";
    } else {
      healthLine.textContent = "API: Degraded";
    }
  } catch (error) {
    healthLine.textContent = "API: Offline";
  }
}
