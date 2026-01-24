// ========================================
// 🏛️ PROFESSOR BOTNOTIC'S PREMIER STUDY HALL
// ========================================

// ───────────────────────────────────────
// STATE MANAGEMENT
// ───────────────────────────────────────
let currentUser = {
  name: 'Guest',
  email: '',
  plan: 'associates',
  id: 'guest'
};

let studySession = {
  subject: 'General',
  startTime: null,
  focusMinutes: 25,
  timerInterval: null,
  timeRemaining: 0,
  isPaused: false
};

let performanceData = {
  quizzes: [],
  studySessions: [],
  totalMinutes: 0,
  averageScore: 0
};

// ───────────────────────────────────────
// INITIALIZATION
// ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  loadPerformanceData();
  loadNotes();
  initializeChat();
  initializeQuiz();
  initializeFlashcards();
  initializeTimer();
  initializeNotes();
  initializeAnalytics();
  initializeTabs();
  updateUI();
  updateStatsDisplay();
  
  // Health check
  checkHealth();
});

// ───────────────────────────────────────
// TAB SYSTEM
// ───────────────────────────────────────
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      switchTab(targetTab);
      
      // Update active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  // Show selected tab
  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }
}

// ───────────────────────────────────────
// USER AUTHENTICATION
// ───────────────────────────────────────
function loadUserData() {
  const stored = localStorage.getItem('botnology_user');
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
      document.getElementById('whoami').textContent = `${currentUser.name} • BN-${currentUser.id.slice(0, 6)}`;
      document.getElementById('planBadge').textContent = currentUser.plan.toUpperCase();
      document.getElementById('syncStatus').textContent = 'READY';
      document.getElementById('syncDot').style.background = 'var(--gold)';
    } catch (e) {
      console.error('User data parse error:', e);
    }
  }
}

// Auth modal handlers
document.getElementById('openAuth')?.addEventListener('click', () => {
  document.getElementById('authModal').classList.add('show');
});

document.getElementById('closeAuth')?.addEventListener('click', () => {
  document.getElementById('authModal').classList.remove('show');
});

document.getElementById('doAuth')?.addEventListener('click', () => {
  const name = document.getElementById('authName').value.trim();
  const email = document.getElementById('authEmail').value.trim();
  const plan = document.getElementById('authPlan').value;
  
  if (!name || !email) {
    alert('Please enter your name and email');
    return;
  }
  
  currentUser = {
    name,
    email,
    plan,
    id: 'usr_' + Math.random().toString(36).substr(2, 9)
  };
  
  localStorage.setItem('botnology_user', JSON.stringify(currentUser));
  document.getElementById('authModal').classList.remove('show');
  loadUserData();
  addWelcomeMessage();
});

// ───────────────────────────────────────
// CHAT SYSTEM
// ───────────────────────────────────────
let chatMessages = [];

function initializeChat() {
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');
  
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
  const subject = studySession.subject;
  const plan = currentUser.plan.toUpperCase();
  
  const welcome = {
    role: 'assistant',
    content: `Welcome to the Study Hall, ${currentUser.name}! I'm Professor Botnotic, your ${plan} tier academic companion. I see you're studying ${subject}. How may I assist your learning today?`
  };
  
  chatMessages = [welcome];
  renderMessages();
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  
  if (!text) return;
  
  // Add user message
  chatMessages.push({ role: 'user', content: text });
  renderMessages();
  input.value = '';
  
  // Show typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'msg msg-assistant';
  typingDiv.innerHTML = `
    <div class="msg-label">Professor Botnotic</div>
    <div class="msg-text">Thinking...</div>
  `;
  document.getElementById('messages').appendChild(typingDiv);
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: chatMessages,
        plan: currentUser.plan,
        context: {
          subject: studySession.subject,
          mode: 'study_hall'
        }
      })
    });
    
    const data = await response.json();
    
    // Remove typing indicator
    typingDiv.remove();
    
    if (data.reply) {
      chatMessages.push({ role: 'assistant', content: data.reply });
      renderMessages();
    } else {
      throw new Error('No reply from server');
    }
  } catch (err) {
    console.error('Chat error:', err);
    typingDiv.remove();
    chatMessages.push({ 
      role: 'assistant', 
      content: 'My apologies, I encountered a technical difficulty. Please try again.' 
    });
    renderMessages();
  }
}

function renderMessages() {
  const container = document.getElementById('messages');
  container.innerHTML = '';
  
  chatMessages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg msg-${msg.role}`;
    
    const label = msg.role === 'user' ? currentUser.name : 'Professor Botnotic';
    
    msgDiv.innerHTML = `
      <div class="msg-label">${label}</div>
      <div class="msg-text">${msg.content}</div>
    `;
    
    container.appendChild(msgDiv);
  });
  
  container.scrollTop = container.scrollHeight;
}

// ───────────────────────────────────────
// NOTES SYSTEM
// ───────────────────────────────────────
function initializeNotes() {
  const notesArea = document.getElementById('notesArea');
  
  // Auto-save every 2 seconds
  let saveTimeout;
  notesArea.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveNotes, 2000);
  });
  
  // Export notes
  document.getElementById('notesExport').addEventListener('click', exportNotes);
  
  // Clear notes
  document.getElementById('notesClear').addEventListener('click', () => {
    if (confirm('Clear all notes? This cannot be undone.')) {
      notesArea.value = '';
      saveNotes();
    }
  });
  
  // Session export
  document.getElementById('sessionExport').addEventListener('click', exportSession);
  
  // Sync now
  document.getElementById('syncNow').addEventListener('click', syncNow);
}

function loadNotes() {
  const key = `botnology_notes_${currentUser.id}`;
  const notes = localStorage.getItem(key);
  if (notes) {
    document.getElementById('notesArea').value = notes;
  }
}

function saveNotes() {
  const key = `botnology_notes_${currentUser.id}`;
  const text = document.getElementById('notesArea').value;
  localStorage.setItem(key, text);
  
  // Show sync indicator
  const syncDot = document.getElementById('syncDot');
  syncDot.style.background = 'var(--gold)';
  setTimeout(() => {
    syncDot.style.background = 'rgba(255,255,255,0.3)';
  }, 500);
}

function exportNotes() {
  const text = document.getElementById('notesArea').value;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `botnology-notes-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportSession() {
  const session = {
    user: currentUser.name,
    date: new Date().toISOString(),
    subject: studySession.subject,
    chat: chatMessages,
    notes: document.getElementById('notesArea').value,
    performance: performanceData
  };
  
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `botnology-session-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function syncNow() {
  const syncStatus = document.getElementById('syncStatus');
  const syncDot = document.getElementById('syncDot');
  
  syncStatus.textContent = 'SYNCING...';
  syncDot.style.background = 'var(--gold)';
  
  saveNotes();
  savePerformanceData();
  
  setTimeout(() => {
    syncStatus.textContent = 'SYNCED';
    setTimeout(() => {
      syncStatus.textContent = 'READY';
      syncDot.style.background = 'rgba(255,255,255,0.3)';
    }, 2000);
  }, 1000);
}

// ───────────────────────────────────────
// FOCUS TIMER (POMODORO)
// ───────────────────────────────────────
function initializeTimer() {
  const startBtn = document.getElementById('focusStart');
  startBtn.addEventListener('click', toggleTimer);
}

function toggleTimer() {
  if (studySession.timerInterval) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (studySession.timeRemaining === 0) {
    studySession.timeRemaining = studySession.focusMinutes * 60;
    studySession.startTime = Date.now();
  }
  
  studySession.isPaused = false;
  
  studySession.timerInterval = setInterval(() => {
    studySession.timeRemaining--;
    
    if (studySession.timeRemaining <= 0) {
      finishTimer();
      return;
    }
    
    updateTimerDisplay();
  }, 1000);
  
  document.getElementById('focusStart').textContent = 'Pause Timer';
  updateTimerDisplay();
}

function pauseTimer() {
  clearInterval(studySession.timerInterval);
  studySession.timerInterval = null;
  studySession.isPaused = true;
  document.getElementById('focusStart').textContent = 'Resume Timer';
}

function finishTimer() {
  clearInterval(studySession.timerInterval);
  studySession.timerInterval = null;
  
  // Record study session
  const sessionRecord = {
    date: new Date().toISOString(),
    subject: studySession.subject,
    minutes: studySession.focusMinutes,
    completed: true
  };
  
  performanceData.studySessions.push(sessionRecord);
  performanceData.totalMinutes += studySession.focusMinutes;
  savePerformanceData();
  
  studySession.timeRemaining = 0;
  document.getElementById('focusTimer').textContent = '✓ Complete!';
  document.getElementById('focusStart').textContent = 'Start Focus (25m)';
  
  // Congratulate
  alert(`🎉 Excellent work, ${currentUser.name}! You completed a ${studySession.focusMinutes} minute focus session.`);
}

function updateTimerDisplay() {
  const minutes = Math.floor(studySession.timeRemaining / 60);
  const seconds = studySession.timeRemaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('focusTimer').textContent = display;
}

// Subject selector
document.getElementById('subjectSelect')?.addEventListener('change', (e) => {
  studySession.subject = e.target.value;
  document.getElementById('subjectLabel').textContent = studySession.subject;
});

// ───────────────────────────────────────
// QUIZ SYSTEM
// ───────────────────────────────────────
let currentQuiz = null;
let quizAnswers = [];

function initializeQuiz() {
  document.getElementById('generateQuizBtn')?.addEventListener('click', async () => {
    const subject = document.getElementById('quizSubject').value;
    const difficulty = document.getElementById('quizDifficulty').value;
    const count = parseInt(document.getElementById('quizCount').value);
    
    document.getElementById('generateQuizBtn').textContent = 'Generating...';
    document.getElementById('generateQuizBtn').disabled = true;
    
    const quiz = await generateQuiz(subject, difficulty, count);
    
    if (quiz) {
      renderQuiz(quiz);
      document.getElementById('quizSetup').style.display = 'none';
      document.getElementById('quizContent').style.display = 'block';
    } else {
      alert('Failed to generate quiz. Please try again.');
    }
    
    document.getElementById('generateQuizBtn').textContent = 'Generate Quiz';
    document.getElementById('generateQuizBtn').disabled = false;
  });
  
  document.getElementById('submitQuizBtn')?.addEventListener('click', () => {
    const results = gradeQuiz();
    if (results) {
      showQuizResults(results);
    }
  });
  
  document.getElementById('resetQuizBtn')?.addEventListener('click', resetQuiz);
  document.getElementById('newQuizBtn')?.addEventListener('click', resetQuiz);
  document.getElementById('reviewQuizBtn')?.addEventListener('click', () => {
    document.getElementById('quizReview').style.display = 'block';
    renderQuizReview();
  });
}

function renderQuiz(quiz) {
  const container = document.getElementById('quizQuestions');
  container.innerHTML = '';
  
  document.getElementById('quizTitle').textContent = `${quiz.subject} - ${quiz.difficulty}`;
  document.getElementById('quizProgress').textContent = `0/${quiz.questions.length}`;
  
  quiz.questions.forEach((q, index) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'quiz-q';
    qDiv.innerHTML = `
      <div style="font-weight:700;margin-bottom:12px">${index + 1}. ${q.question}</div>
      ${q.options.map((opt, i) => `
        <div class="quiz-option" data-q="${index}" data-a="${i}">
          ${opt}
        </div>
      `).join('')}
    `;
    container.appendChild(qDiv);
  });
  
  // Add click handlers
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const qIndex = parseInt(opt.getAttribute('data-q'));
      const aIndex = parseInt(opt.getAttribute('data-a'));
      
      // Remove selection from other options in same question
      document.querySelectorAll(`.quiz-option[data-q="${qIndex}"]`).forEach(o => {
        o.classList.remove('selected');
      });
      
      // Mark this option as selected
      opt.classList.add('selected');
      quizAnswers[qIndex] = aIndex;
      
      // Update progress
      const answered = quizAnswers.filter(a => a !== null && a !== undefined).length;
      document.getElementById('quizProgress').textContent = `${answered}/${quiz.questions.length}`;
    });
  });
}

function showQuizResults(results) {
  document.getElementById('quizContent').style.display = 'none';
  document.getElementById('quizResults').style.display = 'block';
  
  const score = results.score;
  let emoji = '🎉';
  let text = 'Outstanding performance!';
  
  if (score >= 90) {
    emoji = '🏆';
    text = 'Exceptional mastery!';
  } else if (score >= 80) {
    emoji = '🎯';
    text = 'Excellent work!';
  } else if (score >= 70) {
    emoji = '👍';
    text = 'Good job!';
  } else if (score >= 60) {
    emoji = '📚';
    text = 'Keep studying!';
  } else {
    emoji = '💪';
    text = 'Review and try again!';
  }
  
  document.getElementById('resultEmoji').textContent = emoji;
  document.getElementById('resultScore').textContent = `${score}%`;
  document.getElementById('resultText').textContent = text;
  
  updateStatsDisplay();
  updatePerformanceChart();
}

function renderQuizReview() {
  const container = document.getElementById('quizReview');
  container.innerHTML = '<div style="font-weight:700;font-size:16px;margin-bottom:16px">Answer Review</div>';
  
  if (!currentQuiz) return;
  
  currentQuiz.questions.forEach((q, i) => {
    const userAnswer = quizAnswers[i];
    const isCorrect = userAnswer === q.correct;
    
    const reviewDiv = document.createElement('div');
    reviewDiv.className = 'quiz-q';
    reviewDiv.innerHTML = `
      <div style="font-weight:700;margin-bottom:12px">${i + 1}. ${q.question}</div>
      ${q.options.map((opt, optIndex) => {
        let className = 'quiz-option';
        if (optIndex === q.correct) className += ' correct';
        else if (optIndex === userAnswer && !isCorrect) className += ' incorrect';
        return `<div class="${className}">${opt}</div>`;
      }).join('')}
      <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,.02);border-radius:8px;font-size:14px">
        <strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong><br/>
        ${q.explanation}
      </div>
    `;
    container.appendChild(reviewDiv);
  });
}

function resetQuiz() {
  currentQuiz = null;
  quizAnswers = [];
  document.getElementById('quizSetup').style.display = 'block';
  document.getElementById('quizContent').style.display = 'none';
  document.getElementById('quizResults').style.display = 'none';
  document.getElementById('quizReview').style.display = 'none';
}

async function generateQuiz(subject, difficulty, questionCount = 5) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `Generate a ${difficulty} level quiz on ${subject} with ${questionCount} multiple choice questions. Each question should have 4 options (A, B, C, D). Return ONLY valid JSON in this exact format, no other text: {"questions": [{"question": "question text", "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"], "correct": 0, "explanation": "why this answer is correct"}]}`
        }],
        plan: currentUser.plan,
        context: { mode: 'quiz_generation' }
      })
    });
    
    const data = await response.json();
    
    // Parse quiz from response
    try {
      // Extract JSON from response (in case there's extra text)
      let jsonText = data.reply.trim();
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}') + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd);
      }
      
      const quizData = JSON.parse(jsonText);
      currentQuiz = {
        subject,
        difficulty,
        questions: quizData.questions,
        startTime: Date.now()
      };
      quizAnswers = new Array(questionCount).fill(null);
      return currentQuiz;
    } catch (e) {
      console.error('Quiz parse error:', e, data.reply);
      return null;
    }
  } catch (err) {
    console.error('Quiz generation error:', err);
    return null;
  }
}

function gradeQuiz() {
  if (!currentQuiz) return null;
  
  let correct = 0;
  const results = currentQuiz.questions.map((q, i) => {
    const isCorrect = quizAnswers[i] === q.correct;
    if (isCorrect) correct++;
    return {
      question: q.question,
      userAnswer: quizAnswers[i],
      correctAnswer: q.correct,
      isCorrect,
      explanation: q.explanation
    };
  });
  
  const score = Math.round((correct / currentQuiz.questions.length) * 100);
  const timeTaken = Math.round((Date.now() - currentQuiz.startTime) / 1000);
  
  const quizRecord = {
    date: new Date().toISOString(),
    subject: currentQuiz.subject,
    difficulty: currentQuiz.difficulty,
    score,
    correct,
    total: currentQuiz.questions.length,
    timeTaken,
    results
  };
  
  performanceData.quizzes.push(quizRecord);
  calculateAverageScore();
  savePerformanceData();
  
  return quizRecord;
}

// ───────────────────────────────────────
// FLASHCARDS
// ───────────────────────────────────────
let flashcardDeck = [];
let currentFlashcard = 0;
let isFlipped = false;

function initializeFlashcards() {
  document.getElementById('generateFlashcardsBtn')?.addEventListener('click', async () => {
    const topic = document.getElementById('flashcardTopic').value.trim();
    const count = parseInt(document.getElementById('flashcardCount').value);
    
    if (!topic) {
      alert('Please enter a topic for flashcards');
      return;
    }
    
    document.getElementById('generateFlashcardsBtn').textContent = 'Generating...';
    document.getElementById('generateFlashcardsBtn').disabled = true;
    
    const cards = await generateFlashcards(topic, count);
    
    if (cards && cards.length > 0) {
      document.getElementById('flashcardSetup').style.display = 'none';
      document.getElementById('flashcardDisplay').style.display = 'block';
      showFlashcard(0);
    } else {
      alert('Failed to generate flashcards. Please try again.');
    }
    
    document.getElementById('generateFlashcardsBtn').textContent = 'Generate Cards';
    document.getElementById('generateFlashcardsBtn').disabled = false;
  });
  
  document.getElementById('flipCardBtn')?.addEventListener('click', flipCard);
  document.getElementById('prevCardBtn')?.addEventListener('click', () => {
    if (currentFlashcard > 0) {
      showFlashcard(currentFlashcard - 1);
    }
  });
  document.getElementById('nextCardBtn')?.addEventListener('click', () => {
    if (currentFlashcard < flashcardDeck.length - 1) {
      showFlashcard(currentFlashcard + 1);
    }
  });
  document.getElementById('newDeckBtn')?.addEventListener('click', () => {
    document.getElementById('flashcardSetup').style.display = 'block';
    document.getElementById('flashcardDisplay').style.display = 'none';
    flashcardDeck = [];
    currentFlashcard = 0;
  });
}

function showFlashcard(index) {
  currentFlashcard = index;
  isFlipped = false;
  
  const card = flashcardDeck[index];
  document.getElementById('flashcardContent').textContent = card.front;
  document.getElementById('flashcard').classList.remove('flipped');
  document.getElementById('flashcardProgress').textContent = `${index + 1}/${flashcardDeck.length}`;
  
  // Update button states
  document.getElementById('prevCardBtn').disabled = index === 0;
  document.getElementById('nextCardBtn').disabled = index === flashcardDeck.length - 1;
}

function flipCard() {
  isFlipped = !isFlipped;
  const card = flashcardDeck[currentFlashcard];
  
  if (isFlipped) {
    document.getElementById('flashcardContent').textContent = card.back;
    document.getElementById('flashcard').classList.add('flipped');
  } else {
    document.getElementById('flashcardContent').textContent = card.front;
    document.getElementById('flashcard').classList.remove('flipped');
  }
}

async function generateFlashcards(subject, count = 10) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `Generate ${count} flashcards for studying ${subject}. Return ONLY valid JSON in this exact format, no other text: {"cards": [{"front": "question or term", "back": "answer or definition"}]}`
        }],
        plan: currentUser.plan,
        context: { mode: 'flashcard_generation' }
      })
    });
    
    const data = await response.json();
    
    try {
      // Extract JSON from response
      let jsonText = data.reply.trim();
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}') + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd);
      }
      
      const cardData = JSON.parse(jsonText);
      flashcardDeck = cardData.cards;
      currentFlashcard = 0;
      return flashcardDeck;
    } catch (e) {
      console.error('Flashcard parse error:', e, data.reply);
      return null;
    }
  } catch (err) {
    console.error('Flashcard generation error:', err);
    return null;
  }
}

// ───────────────────────────────────────
// PERFORMANCE ANALYTICS
// ───────────────────────────────────────
let performanceChart = null;

function initializeAnalytics() {
  createPerformanceChart();
  updateStatsDisplay();
}

function createPerformanceChart() {
  const ctx = document.getElementById('performanceChart');
  if (!ctx) return;
  
  performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Quiz Score %',
        data: [],
        borderColor: 'rgba(255, 215, 0, 1)',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(255, 215, 0, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 215, 0, 0.5)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (items) => {
              return `Quiz ${items[0].dataIndex + 1}`;
            },
            label: (item) => {
              return `Score: ${item.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: 'rgba(232, 243, 238, 0.7)',
            callback: (value) => value + '%'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          }
        },
        x: {
          ticks: {
            color: 'rgba(232, 243, 238, 0.7)'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          }
        }
      }
    }
  });
  
  updatePerformanceChart();
}

function updatePerformanceChart() {
  if (!performanceChart) return;
  
  const quizzes = performanceData.quizzes.slice(-10); // Last 10 quizzes
  
  performanceChart.data.labels = quizzes.map((q, i) => `Quiz ${i + 1}`);
  performanceChart.data.datasets[0].data = quizzes.map(q => q.score);
  performanceChart.update();
}

function updateStatsDisplay() {
  document.getElementById('totalMinutes').textContent = performanceData.totalMinutes;
  document.getElementById('totalQuizzes').textContent = performanceData.quizzes.length;
  document.getElementById('avgScore').textContent = performanceData.averageScore + '%';
}

function loadPerformanceData() {
  const key = `botnology_performance_${currentUser.id}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      performanceData = JSON.parse(stored);
      calculateAverageScore();
    } catch (e) {
      console.error('Performance data parse error:', e);
    }
  }
}

function savePerformanceData() {
  const key = `botnology_performance_${currentUser.id}`;
  localStorage.setItem(key, JSON.stringify(performanceData));
}

function calculateAverageScore() {
  if (performanceData.quizzes.length === 0) {
    performanceData.averageScore = 0;
    return;
  }
  
  const sum = performanceData.quizzes.reduce((acc, quiz) => acc + quiz.score, 0);
  performanceData.averageScore = Math.round(sum / performanceData.quizzes.length);
}

function updateStatsDisplay() {
  document.getElementById('totalMinutes')?.textContent = performanceData.totalMinutes || 0;
  document.getElementById('totalQuizzes')?.textContent = performanceData.quizzes.length || 0;
  document.getElementById('avgScore')?.textContent = (performanceData.averageScore || 0) + '%';
}

// ───────────────────────────────────────
// HEALTH CHECK
// ───────────────────────────────────────
async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    const status = data.status === 'ok' ? '✓ Online' : '✗ Offline';
    document.getElementById('healthLine').textContent = `API: ${status}`;
  } catch (err) {
    document.getElementById('healthLine').textContent = 'API: ✗ Error';
  }
}

// ───────────────────────────────────────
// UTILITY FUNCTIONS
// ───────────────────────────────────────
function updateUI() {
  // Update all UI elements based on current state
  loadUserData();
  if (studySession.timeRemaining > 0) {
    updateTimerDisplay();
  }
  updateStatsDisplay();
}

// ───────────────────────────────────────
// EXPORTS (for testing/debugging)
// ───────────────────────────────────────
window.StudyHall = {
  generateQuiz,
  gradeQuiz,
  generateFlashcards,
  flipCard,
  currentUser,
  performanceData
};
