// ========================================
// 🎓 BOTNOLOGY101 COURSE MANAGEMENT SYSTEM
// ========================================

// ───────────────────────────────────────
// COURSE CATALOG DATA
// ───────────────────────────────────────
const COURSE_CATALOG = {
  // ANATOMY COURSES
  anatomy101: {
anatomy101: {
    id: 'anatomy101',
    code: 'ANAT-101',
    title: 'Human Anatomy Fundamentals',
    icon: '🫀',
    category: 'anatomy',
    tier: 'associates',
    credits: 4,
    description: 'Introduction to human body systems, organs, and basic anatomical terminology. Perfect for beginning students.',
    syllabus: [
      { week: 1, topic: 'Introduction to Anatomical Terminology', status: 'pending' },
      { week: 2, topic: 'Skeletal System', status: 'pending' },
      { week: 3, topic: 'Muscular System', status: 'pending' },
      { week: 4, topic: 'Cardiovascular System', status: 'pending' },
      { week: 5, topic: 'Respiratory System', status: 'pending' },
      { week: 6, topic: 'Nervous System Basics', status: 'pending' },
      { week: 7, topic: 'Digestive System', status: 'pending' },
      { week: 8, topic: 'Final Exam', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Skeletal System Quiz', type: 'quiz', points: 100, due: '2026-02-15' },
      { id: 2, title: 'Muscle Identification Lab', type: 'lab', points: 150, due: '2026-03-01' },
      { id: 3, title: 'Cardiovascular Case Study', type: 'essay', points: 200, due: '2026-03-20' }
    ]
  },
  anatomy201: {
    id: 'anatomy201',
    code: 'ANAT-201',
    title: 'Advanced Human Anatomy',
    icon: '🧠',
    category: 'anatomy',
    tier: 'bachelors',
    credits: 4,
    description: 'Deep dive into complex anatomical structures, physiological relationships, and clinical applications.',
    syllabus: [
      { week: 1, topic: 'Neuroanatomy: Brain Structures', status: 'pending' },
      { week: 2, topic: 'Cardiac Anatomy & Physiology', status: 'pending' },
      { week: 3, topic: 'Pulmonary System Details', status: 'pending' },
      { week: 4, topic: 'Endocrine System', status: 'pending' },
      { week: 5, topic: 'Renal System', status: 'pending' },
      { week: 6, topic: 'Clinical Case Studies', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Brain Mapping Project', type: 'project', points: 300, due: '2026-02-28' },
      { id: 2, title: 'Cardiac Pathology Analysis', type: 'essay', points: 250, due: '2026-03-15' }
    ]
  },
  anatomy301: {
    id: 'anatomy301',
    code: 'ANAT-301',
    title: 'Clinical Anatomy & Research',
    icon: '🔬',
    category: 'anatomy',
    tier: 'masters',
    credits: 5,
    description: 'Master-level anatomical research, surgical anatomy, and advanced medical applications.',
    syllabus: [
      { week: 1, topic: 'Research Methodologies in Anatomy', status: 'pending' },
      { week: 2, topic: 'Surgical Anatomy Applications', status: 'pending' },
      { week: 3, topic: 'Advanced Neuroanatomy', status: 'pending' },
      { week: 4, topic: 'Thesis Development', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Original Research Proposal', type: 'thesis', points: 500, due: '2026-04-01' },
      { id: 2, title: 'Surgical Anatomy Presentation', type: 'presentation', points: 400, due: '2026-04-15' }
    ]
  },

  // MATHEMATICS COURSES
  calc1: {
    id: 'calc1',
    code: 'MATH-141',
    title: 'Calculus I: Limits & Derivatives',
    icon: '📐',
    category: 'math',
    tier: 'associates',
    credits: 4,
    description: 'Foundational calculus concepts including limits, continuity, derivatives, and applications.',
    syllabus: [
      { week: 1, topic: 'Limits and Continuity', status: 'pending' },
      { week: 2, topic: 'Derivative Rules', status: 'pending' },
      { week: 3, topic: 'Applications of Derivatives', status: 'pending' },
      { week: 4, topic: 'Related Rates', status: 'pending' },
      { week: 5, topic: 'Optimization Problems', status: 'pending' },
      { week: 6, topic: 'Curve Sketching', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Limits Problem Set', type: 'homework', points: 100, due: '2026-02-10' },
      { id: 2, title: 'Derivative Applications Quiz', type: 'quiz', points: 150, due: '2026-03-05' },
      { id: 3, title: 'Optimization Project', type: 'project', points: 200, due: '2026-03-25' }
    ]
  },
  calc2: {
    id: 'calc2',
    code: 'MATH-142',
    title: 'Calculus II: Integration & Series',
    icon: '∫',
    category: 'math',
    tier: 'bachelors',
    credits: 4,
    description: 'Advanced integration techniques, sequences, series, and polar coordinates.',
    syllabus: [
      { week: 1, topic: 'Integration Techniques', status: 'pending' },
      { week: 2, topic: 'Applications of Integration', status: 'pending' },
      { week: 3, topic: 'Sequences and Series', status: 'pending' },
      { week: 4, topic: 'Taylor and Maclaurin Series', status: 'pending' },
      { week: 5, topic: 'Polar Coordinates', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Integration Methods Quiz', type: 'quiz', points: 150, due: '2026-02-20' },
      { id: 2, title: 'Series Convergence Problem Set', type: 'homework', points: 200, due: '2026-03-10' }
    ]
  },
  calc3: {
    id: 'calc3',
    code: 'MATH-241',
    title: 'Calculus III: Multivariable',
    icon: '∇',
    category: 'math',
    tier: 'masters',
    credits: 4,
    description: 'Multivariable calculus, vector fields, line integrals, and Green\'s theorem.',
    syllabus: [
      { week: 1, topic: 'Vectors and 3D Space', status: 'pending' },
      { week: 2, topic: 'Partial Derivatives', status: 'pending' },
      { week: 3, topic: 'Multiple Integrals', status: 'pending' },
      { week: 4, topic: 'Vector Calculus', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Vector Field Analysis', type: 'project', points: 300, due: '2026-03-15' },
      { id: 2, title: 'Line Integral Problem Set', type: 'homework', points: 250, due: '2026-04-01' }
    ]
  },

  trig101: {
    id: 'trig101',
    code: 'MATH-110',
    title: 'Trigonometry Fundamentals',
    icon: '📊',
    category: 'math',
    tier: 'associates',
    credits: 3,
    description: 'Trigonometric functions, identities, equations, and applications.',
    syllabus: [
      { week: 1, topic: 'Unit Circle and Trig Functions', status: 'pending' },
      { week: 2, topic: 'Trigonometric Identities', status: 'pending' },
      { week: 3, topic: 'Solving Trig Equations', status: 'pending' },
      { week: 4, topic: 'Law of Sines and Cosines', status: 'pending' },
      { week: 5, topic: 'Applications', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Unit Circle Mastery Quiz', type: 'quiz', points: 100, due: '2026-02-12' },
      { id: 2, title: 'Identity Proofs', type: 'homework', points: 150, due: '2026-03-01' }
    ]
  },

  // PHYSICS COURSES
  physics101: {
    id: 'physics101',
    code: 'PHYS-101',
    title: 'Physics I: Mechanics',
    icon: '⚛️',
    category: 'physics',
    tier: 'associates',
    credits: 4,
    description: 'Classical mechanics including kinematics, dynamics, energy, and momentum.',
    syllabus: [
      { week: 1, topic: 'Kinematics in 1D and 2D', status: 'pending' },
      { week: 2, topic: 'Newton\'s Laws of Motion', status: 'pending' },
      { week: 3, topic: 'Work and Energy', status: 'pending' },
      { week: 4, topic: 'Momentum and Collisions', status: 'pending' },
      { week: 5, topic: 'Rotational Motion', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Kinematics Problem Set', type: 'homework', points: 100, due: '2026-02-14' },
      { id: 2, title: 'Energy Lab Report', type: 'lab', points: 200, due: '2026-03-07' }
    ]
  },
  physics201: {
    id: 'physics201',
    code: 'PHYS-201',
    title: 'Physics II: Electricity & Magnetism',
    icon: '⚡',
    category: 'physics',
    tier: 'bachelors',
    credits: 4,
    description: 'Electromagnetic theory, circuits, fields, and Maxwell\'s equations.',
    syllabus: [
      { week: 1, topic: 'Electric Fields and Potential', status: 'pending' },
      { week: 2, topic: 'Capacitance and Circuits', status: 'pending' },
      { week: 3, topic: 'Magnetic Fields', status: 'pending' },
      { week: 4, topic: 'Electromagnetic Induction', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Circuit Analysis Quiz', type: 'quiz', points: 150, due: '2026-02-25' },
      { id: 2, title: 'EM Field Project', type: 'project', points: 300, due: '2026-03-20' }
    ]
  },

  // CHEMISTRY COURSES
  chem101: {
    id: 'chem101',
    code: 'CHEM-101',
    title: 'General Chemistry I',
    icon: '🧪',
    category: 'chemistry',
    tier: 'associates',
    credits: 4,
    description: 'Fundamental chemistry principles, atomic structure, bonding, and reactions.',
    syllabus: [
      { week: 1, topic: 'Atomic Structure', status: 'pending' },
      { week: 2, topic: 'Chemical Bonding', status: 'pending' },
      { week: 3, topic: 'Stoichiometry', status: 'pending' },
      { week: 4, topic: 'Chemical Reactions', status: 'pending' },
      { week: 5, topic: 'Gas Laws', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Bonding Quiz', type: 'quiz', points: 100, due: '2026-02-16' },
      { id: 2, title: 'Stoichiometry Lab', type: 'lab', points: 150, due: '2026-03-03' }
    ]
  },
  chem201: {
    id: 'chem201',
    code: 'CHEM-201',
    title: 'Organic Chemistry I',
    icon: '⚗️',
    category: 'chemistry',
    tier: 'bachelors',
    credits: 4,
    description: 'Organic compound structure, nomenclature, reactions, and mechanisms.',
    syllabus: [
      { week: 1, topic: 'Structure and Bonding', status: 'pending' },
      { week: 2, topic: 'Functional Groups', status: 'pending' },
      { week: 3, topic: 'Stereochemistry', status: 'pending' },
      { week: 4, topic: 'Reaction Mechanisms', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Mechanism Quiz', type: 'quiz', points: 150, due: '2026-02-22' },
      { id: 2, title: 'Synthesis Project', type: 'project', points: 300, due: '2026-03-18' }
    ]
  },

  // BIOLOGY COURSES
  bio101: {
    id: 'bio101',
    code: 'BIOL-101',
    title: 'Introduction to Biology',
    icon: '🧬',
    category: 'biology',
    tier: 'associates',
    credits: 4,
    description: 'Cell biology, genetics, evolution, and ecology fundamentals.',
    syllabus: [
      { week: 1, topic: 'Cell Structure and Function', status: 'pending' },
      { week: 2, topic: 'DNA and Genetics', status: 'pending' },
      { week: 3, topic: 'Evolution', status: 'pending' },
      { week: 4, topic: 'Ecology and Ecosystems', status: 'pending' }
    ],
    assignments: [
      { id: 1, title: 'Cell Biology Quiz', type: 'quiz', points: 100, due: '2026-02-18' },
      { id: 2, title: 'Genetics Lab Report', type: 'lab', points: 200, due: '2026-03-12' }
    ]
  }
};

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_enrollment', icon: '🎓', title: 'First Step', description: 'Enrolled in your first course', xp: 100 },
  { id: 'quiz_master', icon: '📝', title: 'Quiz Master', description: 'Scored 100% on a quiz', xp: 250 },
  { id: 'assignment_ace', icon: '✅', title: 'Assignment Ace', description: 'Completed 10 assignments', xp: 500 },
  { id: 'perfect_week', icon: '⭐', title: 'Perfect Week', description: 'Completed all weekly assignments on time', xp: 300 },
  { id: 'course_complete', icon: '🏆', title: 'Course Champion', description: 'Completed your first course', xp: 1000 },
  { id: 'gpa_4', icon: '💎', title: 'Perfect GPA', description: 'Maintained a 4.0 GPA', xp: 2000 },
  { id: 'study_streak', icon: '🔥', title: 'Dedicated Scholar', description: '7-day study streak', xp: 400 }
];

// ───────────────────────────────────────
// STATE MANAGEMENT
// ───────────────────────────────────────
let currentUser = {
  name: 'Guest',
  email: '',
  plan: 'associates',
  id: 'guest'
};

let studentData = {
  enrolledCourses: [],
  completedAssignments: [],
  grades: {},
  achievements: [],
  xp: 0,
  level: 1
};

// ───────────────────────────────────────
// INITIALIZATION
// ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  loadStudentData();
  initializeTabs();
  initializeFilters();
  initializeStudentCard();
  renderEnrolledCourses();
  renderCourseCatalog();
  renderAssignments();
  renderGrades();
  renderAchievements();
  updateDashboardStats();
  createGPAChart();
});

// ───────────────────────────────────────
// USER AUTHENTICATION
// ───────────────────────────────────────
function loadUserData() {
  const stored = localStorage.getItem('botnology_user');
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
      document.getElementById('studentName').textContent = currentUser.name;
      document.getElementById('planBadge').textContent = currentUser.plan.toUpperCase();
      document.getElementById('studentId').textContent = 'BN-' + currentUser.id.slice(0, 6).toUpperCase();
      
      // Load student photo
      loadStudentPhoto();
    } catch (e) {
      console.error('User data parse error:', e);
    }
  }
}

// ───────────────────────────────────────
// STUDENT ID CARD WITH PHOTO UPLOAD
// ───────────────────────────────────────
function initializeStudentCard() {
  const studentCard = document.getElementById('studentCard');
  const photoUpload = document.getElementById('photoUpload');
  const studentPhoto = document.getElementById('studentPhoto');
  
  // Click card to upload photo OR show ID card popup
  studentCard?.addEventListener('click', (e) => {
    // If user is signed in, show ID card popup
    if (currentUser.id !== 'guest') {
      showStudentIdCard();
    } else {
      // Guest user - prompt to upload photo
      photoUpload?.click();
    }
  });
  
  // Handle photo upload
  photoUpload?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, GIF, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
    
    // Read and store image
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      
      // Save to localStorage
      const key = `botnology_photo_${currentUser.id}`;
      localStorage.setItem(key, imageData);
      
      // Update all displays
      updateStudentPhoto(imageData);
      
      // Add animation
      studentPhoto.style.transform = 'scale(1.05)';
      setTimeout(() => {
        studentPhoto.style.transform = 'scale(1)';
      }, 300);
      
      // Show success message
      showNotification('✅ Profile photo updated!');
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  });
  
  // Close ID card modal
  document.getElementById('closeIdCard')?.addEventListener('click', () => {
    document.getElementById('studentIdModal').classList.remove('show');
  });
}

function updateStudentPhoto(imageData) {
  // Update main student photo
  const studentPhoto = document.getElementById('studentPhoto');
  if (studentPhoto) {
    studentPhoto.src = imageData;
  }
  
  // Update ID card photo
  const idCardPhoto = document.getElementById('idCardPhoto');
  if (idCardPhoto) {
    idCardPhoto.src = imageData;
  }
}

function showStudentIdCard() {
  // Update ID card with current data
  document.getElementById('idCardName').textContent = currentUser.name;
  document.getElementById('idCardPlan').textContent = currentUser.plan.toUpperCase() + ' DEGREE';
  document.getElementById('idCardStudentId').textContent = 'BN-' + currentUser.id.slice(0, 6).toUpperCase();
  document.getElementById('idCardGpa').textContent = calculateGPA().toFixed(2);
  document.getElementById('idCardEnrolled').textContent = studentData.enrolledCourses.length + ' Courses';
  document.getElementById('idCardLevel').textContent = Math.floor(studentData.xp / 1000) + 1;
  document.getElementById('idCardIssued').textContent = new Date().getFullYear();
  
  // Load photo
  const key = `botnology_photo_${currentUser.id}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    document.getElementById('idCardPhoto').src = stored;
  } else {
    document.getElementById('idCardPhoto').src = '/dr-botonic.jpeg';
  }
  
  // Show modal
  document.getElementById('studentIdModal').classList.add('show');
}

function loadStudentPhoto() {
  const key = `botnology_photo_${currentUser.id}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    const studentPhoto = document.getElementById('studentPhoto');
    if (studentPhoto) {
      studentPhoto.src = stored;
    }
  }
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 16px 24px;
    background: linear-gradient(135deg, var(--gold), rgba(255,215,0,.8));
    color: var(--black);
    border-radius: 12px;
    font-weight: 700;
    box-shadow: 0 8px 24px rgba(255,215,0,.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add animation styles
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

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
  renderCourseCatalog(); // Refresh to show tier-appropriate courses
});

// ───────────────────────────────────────
// STUDENT DATA MANAGEMENT
// ───────────────────────────────────────
function loadStudentData() {
  const key = `botnology_student_${currentUser.id}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      studentData = JSON.parse(stored);
    } catch (e) {
      console.error('Student data parse error:', e);
    }
  }
}

function saveStudentData() {
  const key = `botnology_student_${currentUser.id}`;
  localStorage.setItem(key, JSON.stringify(studentData));
}

// ───────────────────────────────────────
// TAB SYSTEM
// ───────────────────────────────────────
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      switchTab(targetTab);
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
}

// ───────────────────────────────────────
// FILTER SYSTEM
// ───────────────────────────────────────
function initializeFilters() {
  const filters = document.querySelectorAll('.filter-btn');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      
      filterCatalog(filter);
    });
  });
}

function filterCatalog(category) {
  const cards = document.querySelectorAll('#catalogCourses .course-card');
  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    if (category === 'all' || cardCategory === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// ───────────────────────────────────────
// COURSE RENDERING
// ───────────────────────────────────────
function renderEnrolledCourses() {
  const container = document.getElementById('enrolledCourses');
  const emptyState = document.getElementById('enrolledEmpty');
  
  if (studentData.enrolledCourses.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'grid';
  emptyState.style.display = 'none';
  container.innerHTML = '';
  
  studentData.enrolledCourses.forEach(courseId => {
    const course = COURSE_CATALOG[courseId];
    if (!course) return;
    
    const progress = calculateCourseProgress(courseId);
    const grade = studentData.grades[courseId] || { current: 0, letter: 'N/A' };
    
    const card = createCourseCard(course, true, progress, grade);
    container.appendChild(card);
  });
}

function renderCourseCatalog() {
  const container = document.getElementById('catalogCourses');
  container.innerHTML = '';

  Object.values(COURSE_CATALOG).forEach(course => {
    // Filter by tier
    const tierOrder = { associates: 1, bachelors: 2, masters: 3 };
    const userTierLevel = tierOrder[currentUser.plan];
    const courseTierLevel = tierOrder[course.tier];

    if (courseTierLevel > userTierLevel) {
      return; // Don't show courses above user's tier
    }

    const isEnrolled = studentData.enrolledCourses.includes(course.id);
    const grade = studentData.grades[course.id] || { current: 0, letter: 'N/A' }; // Ensure grade object
    const card = createCourseCard(course, isEnrolled, 0, grade);
    container.appendChild(card);
  });
}

function createCourseCard(course, isEnrolled = false, progress = 0, grade = null) {
  const card = document.createElement('div');
  card.className = `course-card ${isEnrolled ? 'enrolled' : ''}`;
  card.setAttribute('data-category', course.category);
  
  card.innerHTML = `
    <div class="course-header">
      <div class="course-icon">${course.icon}</div>
      <div style="flex:1">
        <div class="course-title">${course.title}</div>
        <div class="course-code">${course.code} • ${course.credits} Credits</div>
      </div>
    </div>
    <div class="course-desc">${course.description}</div>
    ${isEnrolled ? `
      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:8px">
        <span>Progress: ${progress}%</span>
        <span>Grade: ${grade.letter}</span>
      </div>
    ` : ''}
    <div class="course-meta">
      <div class="course-stat">
        <span>🎯</span>
        <span>${course.tier.toUpperCase()}</span>
      </div>
      <div class="course-stat">
        <span>📅</span>
        <span>${course.syllabus.length} Weeks</span>
      </div>
      <div class="course-stat">
        <span>📝</span>
        <span>${course.assignments.length} Assignments</span>
      </div>
    </div>
    <button class="btn ${isEnrolled ? '' : 'gold'}" style="width:100%;margin-top:16px;font-weight:700">
      ${isEnrolled ? 'View Course' : 'Enroll Now'}
    </button>
  `;
  
  card.querySelector('button').addEventListener('click', (e) => {
    e.stopPropagation();
    if (isEnrolled) {
      showCourseDetail(course.id);
    } else {
      enrollInCourse(course.id);
    }
  });
  
  return card;
}

function calculateCourseProgress(courseId) {
  const course = COURSE_CATALOG[courseId];
  if (!course) return 0;
  
  const completed = studentData.completedAssignments.filter(a => 
    a.courseId === courseId
  ).length;
  
  return Math.round((completed / course.assignments.length) * 100);
}

// ───────────────────────────────────────
// COURSE ENROLLMENT
// ───────────────────────────────────────
function enrollInCourse(courseId) {
  const course = COURSE_CATALOG[courseId];
  if (!course) return;
  
  if (studentData.enrolledCourses.includes(courseId)) {
    alert('You are already enrolled in this course!');
    return;
  }
  
  studentData.enrolledCourses.push(courseId);
  studentData.grades[courseId] = { current: 0, letter: 'N/A', assignments: [] };
  
  // Award achievement
  if (studentData.enrolledCourses.length === 1) {
    awardAchievement('first_enrollment');
  }
  
  saveStudentData();
  renderEnrolledCourses();
  renderCourseCatalog();
  updateDashboardStats();
  
  alert(`✅ Successfully enrolled in ${course.title}!`);
}

// ───────────────────────────────────────
// COURSE DETAIL MODAL
// ───────────────────────────────────────
function showCourseDetail(courseId) {
  const course = COURSE_CATALOG[courseId];
  if (!course) return;
  
  document.getElementById('modalCourseIcon').textContent = course.icon;
  document.getElementById('modalCourseTitle').textContent = course.title;
  document.getElementById('modalCourseCode').textContent = course.code;
  
  const content = document.getElementById('modalCourseContent');
  content.innerHTML = `
    <div class="syllabus">
      <div style="font-weight:700;font-size:16px;margin-bottom:16px">📚 Course Syllabus</div>
      ${course.syllabus.map((item, i) => `
        <div class="syllabus-item ${item.status === 'completed' ? 'completed' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700;margin-bottom:4px">Week ${item.week}: ${item.topic}</div>
            </div>
            <div class="badge">${item.status === 'completed' ? '✓ Complete' : 'Pending'}</div>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div style="margin-top:24px">
      <div style="font-weight:700;font-size:16px;margin-bottom:16px">📝 Assignments</div>
      ${course.assignments.map(a => `
        <div class="assignment-card">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
            <div style="font-weight:700">${a.title}</div>
            <div class="badge gold">${a.points} pts</div>
          </div>
          <div style="font-size:13px;color:rgba(232,243,238,.6)">
            Type: ${a.type.toUpperCase()} • Due: ${a.due}
          </div>
          <button class="btn small gold" style="margin-top:12px" onclick="window.location.href='/study-hall.html'">
            Start Assignment
          </button>
        </div>
      `).join('')}
    </div>
  `;
  
  document.getElementById('courseModal').classList.add('show');
}

document.getElementById('closeCourseModal')?.addEventListener('click', () => {
  document.getElementById('courseModal').classList.remove('show');
});

// ───────────────────────────────────────
// ASSIGNMENTS
// ───────────────────────────────────────
function renderAssignments() {
  const container = document.getElementById('assignmentsList');
  container.innerHTML = '';
  
  if (studentData.enrolledCourses.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:rgba(232,243,238,.6)">
        <div style="font-size:48px;margin-bottom:16px">📝</div>
        <div>No assignments yet. Enroll in courses to see assignments.</div>
      </div>
    `;
    return;
  }
  
  studentData.enrolledCourses.forEach(courseId => {
    const course = COURSE_CATALOG[courseId];
    if (!course) return;
    
    course.assignments.forEach(assignment => {
      const completed = studentData.completedAssignments.find(
        a => a.courseId === courseId && a.assignmentId === assignment.id
      );
      
      const card = document.createElement('div');
      card.className = 'assignment-card';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <div style="font-weight:700;font-size:16px;margin-bottom:4px">${assignment.title}</div>
            <div style="font-size:13px;color:rgba(232,243,238,.6)">
              ${course.code}: ${course.title}
            </div>
            <div style="font-size:13px;color:rgba(232,243,238,.6);margin-top:4px">
              Due: ${assignment.due} • ${assignment.type.toUpperCase()}
            </div>
          </div>
          <div>
            <div class="badge gold" style="margin-bottom:8px">${assignment.points} pts</div>
            ${completed ? `
              <div class="badge" style="background:#10b981">✓ ${completed.score}/${assignment.points}</div>
            ` : ''}
          </div>
        </div>
        ${!completed ? `
          <button class="btn gold" style="margin-top:16px;font-weight:700" onclick="window.location.href='/study-hall.html'">
            Start Assignment
          </button>
        ` : ''}
      `;
      container.appendChild(card);
    });
  });
}

// ───────────────────────────────────────
// GRADES & GPA
// ───────────────────────────────────────
function renderGrades() {
  const container = document.getElementById('courseGrades');
  container.innerHTML = '';
  
  if (studentData.enrolledCourses.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:rgba(232,243,238,.6)">
        No grades yet. Complete assignments to see your grades.
      </div>
    `;
    return;
  }
  
  studentData.enrolledCourses.forEach(courseId => {
    const course = COURSE_CATALOG[courseId];
    const gradeData = studentData.grades[courseId] || { current: 0, letter: 'N/A' };
    
    const gradeClass = gradeData.letter === 'A' ? 'grade-a' : 
                       gradeData.letter === 'B' ? 'grade-b' :
                       gradeData.letter === 'C' ? 'grade-c' : 'grade-f';
    
    const card = document.createElement('div');
    card.className = 'assignment-card';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:16px">${course.title}</div>
          <div style="font-size:13px;color:rgba(232,243,238,.6);margin-top:4px">${course.code}</div>
        </div>
        <div class="grade-badge ${gradeClass}">${gradeData.letter}</div>
      </div>
      <div class="progress-bar" style="margin-top:16px">
        <div class="progress-fill" style="width:${gradeData.current}%"></div>
      </div>
      <div style="text-align:center;font-size:14px;margin-top:8px;color:rgba(232,243,238,.7)">
        ${gradeData.current.toFixed(1)}%
      </div>
    `;
    container.appendChild(card);
  });
  
  updateProfessorComment();
}

function updateProfessorComment() {
  const gpa = calculateGPA();
  let comment = '';
  
  if (gpa >= 3.8) {
    comment = "Outstanding work! You're mastering the material with exceptional dedication. Keep up this excellent momentum!";
  } else if (gpa >= 3.5) {
    comment = "Excellent progress! Your consistent effort is yielding strong results. Push for that perfect score!";
  } else if (gpa >= 3.0) {
    comment = "Good work! You're showing solid understanding. Focus on the challenging topics for even better results.";
  } else if (gpa >= 2.5) {
    comment = "You're making progress. I recommend more practice with the fundamentals and don't hesitate to ask questions!";
  } else {
    comment = "Let's work together to improve your understanding. Schedule extra study sessions and review the basics thoroughly.";
  }
  
  document.getElementById('professorComment').textContent = comment;
}

function calculateGPA() {
  if (studentData.enrolledCourses.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  studentData.enrolledCourses.forEach(courseId => {
    const course = COURSE_CATALOG[courseId];
    const gradeData = studentData.grades[courseId];
    
    if (gradeData && gradeData.current > 0) {
      const gradePoint = percentageToGradePoint(gradeData.current);
      totalPoints += gradePoint * course.credits;
      totalCredits += course.credits;
    }
  });
  
  return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
}

function percentageToGradePoint(percentage) {
  if (percentage >= 93) return 4.0;
  if (percentage >= 90) return 3.7;
  if (percentage >= 87) return 3.3;
  if (percentage >= 83) return 3.0;
  if (percentage >= 80) return 2.7;
  if (percentage >= 77) return 2.3;
  if (percentage >= 73) return 2.0;
  if (percentage >= 70) return 1.7;
  if (percentage >= 67) return 1.3;
  if (percentage >= 65) return 1.0;
  return 0;
}

let gpaChart = null;

function createGPAChart() {
  const ctx = document.getElementById('gpaChart');
  if (!ctx) return;
  
  gpaChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'],
      datasets: [{
        label: 'GPA',
        data: [0, 0, 0, 0, calculateGPA()],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 4.0,
          ticks: { color: 'rgba(232, 243, 238, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        x: {
          ticks: { color: 'rgba(232, 243, 238, 0.7)' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });
}

// ───────────────────────────────────────
// ACHIEVEMENTS
// ───────────────────────────────────────
function renderAchievements() {
  const container = document.getElementById('achievementBadges');
  container.innerHTML = '';
  
  ACHIEVEMENTS.forEach(achievement => {
    const earned = studentData.achievements.includes(achievement.id);
    const badge = document.createElement('div');
    badge.className = 'achievement-badge';
    badge.style.opacity = earned ? '1' : '0.3';
    badge.innerHTML = `
      <span style="font-size:24px">${achievement.icon}</span>
      <div>
        <div style="font-weight:700">${achievement.title}</div>
        <div style="font-size:12px;color:rgba(232,243,238,.6)">${achievement.description}</div>
      </div>
    `;
    container.appendChild(badge);
  });
  
  // Update level display
  const level = Math.floor(studentData.xp / 1000) + 1;
  const xpInLevel = studentData.xp % 1000;
  const xpToNext = 1000;
  const progress = (xpInLevel / xpToNext) * 100;
  
  document.getElementById('studentLevel').textContent = level;
  document.getElementById('levelProgress').style.width = progress + '%';
  document.getElementById('xpCurrent').textContent = xpInLevel;
  document.getElementById('xpNext').textContent = xpToNext;
}

function awardAchievement(achievementId) {
  if (studentData.achievements.includes(achievementId)) return;
  
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return;
  
  studentData.achievements.push(achievementId);
  studentData.xp += achievement.xp;
  saveStudentData();
  
  alert(`🏆 Achievement Unlocked: ${achievement.title}!\n+${achievement.xp} XP`);
  renderAchievements();
}

// ───────────────────────────────────────
// DASHBOARD STATS
// ───────────────────────────────────────
function updateDashboardStats() {
  document.getElementById('enrolledCount').textContent = studentData.enrolledCourses.length;
  document.getElementById('overallGPA').textContent = calculateGPA().toFixed(2);
  document.getElementById('achievementCount').textContent = studentData.achievements.length;
}

// ───────────────────────────────────────
// EXPORTS
// ───────────────────────────────────────
window.CourseSystem = {
  enrollInCourse,
  showCourseDetail,
  awardAchievement,
  studentData
};

// Temporary script to log localStorage content
console.log('botnology_user:', localStorage.getItem('botnology_user'));

// Temporary simulation script to test loadUserData functionality
localStorage.setItem('botnology_user', JSON.stringify({
  name: 'Test User',
  email: 'testuser@example.com',
  plan: 'bachelors',
  id: 'test123'
}));
loadUserData();
console.log('Simulated currentUser:', currentUser);