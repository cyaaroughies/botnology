"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Tab = "my-courses" | "catalog" | "assignments" | "grades" | "achievements" | "id-card";

interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  schedule: string;
  room: string;
  enrolled: number;
  capacity: number;
  description: string;
  category: string;
  grade?: string;
  progress?: number;
  color: string;
}

interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded" | "late";
  points: number;
  earnedPoints?: number;
  description: string;
}

interface GradeEntry {
  courseId: string;
  courseName: string;
  courseCode: string;
  credits: number;
  grade: string;
  gradePoints: number;
  semester: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface GPAPoint {
  semester: string;
  gpa: number;
}

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────

const ENROLLED_COURSES: Course[] = [
  {
    id: "c1", code: "CS401", name: "Advanced Algorithms", instructor: "Dr. Sarah Chen",
    credits: 4, schedule: "MWF 9:00–10:00 AM", room: "Tech 302",
    enrolled: 28, capacity: 30, description: "Deep dive into algorithm design, complexity analysis, and optimization techniques including dynamic programming, graph algorithms, and NP-completeness.",
    category: "Computer Science", grade: "A", progress: 78, color: "#6366f1",
  },
  {
    id: "c2", code: "MATH301", name: "Linear Algebra", instructor: "Prof. James Whitfield",
    credits: 3, schedule: "TTh 11:00 AM–12:30 PM", room: "Math 210",
    enrolled: 35, capacity: 40, description: "Vector spaces, linear transformations, eigenvalues, eigenvectors, and applications to data science and machine learning.",
    category: "Mathematics", grade: "A-", progress: 65, color: "#8b5cf6",
  },
  {
    id: "c3", code: "CS350", name: "Operating Systems", instructor: "Dr. Marcus Johnson",
    credits: 4, schedule: "MWF 1:00–2:00 PM", room: "Tech 115",
    enrolled: 22, capacity: 25, description: "Process management, memory management, file systems, concurrency, and distributed systems fundamentals.",
    category: "Computer Science", grade: "B+", progress: 55, color: "#ec4899",
  },
  {
    id: "c4", code: "ENG205", name: "Technical Writing", instructor: "Prof. Linda Park",
    credits: 2, schedule: "Th 3:00–5:00 PM", room: "Hum 401",
    enrolled: 18, capacity: 20, description: "Effective communication in technical and professional environments, documentation, proposals, and presentations.",
    category: "English", grade: "A", progress: 82, color: "#10b981",
  },
  {
    id: "c5", code: "CS420", name: "Machine Learning", instructor: "Dr. Anika Patel",
    credits: 4, schedule: "TTh 9:30–11:00 AM", room: "Tech 220",
    enrolled: 30, capacity: 30, description: "Supervised and unsupervised learning, neural networks, model evaluation, and real-world ML applications.",
    category: "Computer Science", grade: "B+", progress: 60, color: "#f59e0b",
  },
];

const CATALOG_COURSES: Course[] = [
  ...ENROLLED_COURSES,
  {
    id: "c6", code: "CS480", name: "Distributed Systems", instructor: "Dr. Carlos Rivera",
    credits: 4, schedule: "MWF 10:00–11:00 AM", room: "Tech 305",
    enrolled: 15, capacity: 25, description: "Design and implementation of distributed systems, consensus algorithms, fault tolerance, and scalability.",
    category: "Computer Science", color: "#ef4444",
  },
  {
    id: "c7", code: "MATH401", name: "Probability & Statistics", instructor: "Prof. Emily Nguyen",
    credits: 3, schedule: "TTh 2:00–3:30 PM", room: "Math 105",
    enrolled: 40, capacity: 45, description: "Probability theory, statistical inference, hypothesis testing, regression, and applications in engineering.",
    category: "Mathematics", color: "#06b6d4",
  },
  {
    id: "c8", code: "CS460", name: "Database Systems", instructor: "Dr. Rachel Kim",
    credits: 3, schedule: "MWF 2:00–3:00 PM", room: "Tech 118",
    enrolled: 25, capacity: 30, description: "Relational models, SQL, NoSQL, query optimization, transactions, and distributed databases.",
    category: "Computer Science", color: "#84cc16",
  },
  {
    id: "c9", code: "CS490", name: "Cybersecurity Fundamentals", instructor: "Dr. Tom Bradley",
    credits: 3, schedule: "TTh 4:00–5:30 PM", room: "Tech 200",
    enrolled: 20, capacity: 30, description: "Network security, cryptography, ethical hacking, and security policy and compliance.",
    category: "Computer Science", color: "#f97316",
  },
  {
    id: "c10", code: "PHYS201", name: "Modern Physics", instructor: "Prof. David Stern",
    credits: 4, schedule: "MWF 8:00–9:00 AM", room: "Sci 101",
    enrolled: 30, capacity: 35, description: "Special relativity, quantum mechanics, atomic and nuclear physics, and applications.",
    category: "Physics", color: "#a855f7",
  },
];

const ASSIGNMENTS: Assignment[] = [
  { id: "a1", courseId: "c1", courseName: "Advanced Algorithms", title: "Dynamic Programming Problem Set", dueDate: "2026-06-02", status: "pending", points: 100, description: "Solve 5 DP problems including LCS, knapsack, and coin change variants." },
  { id: "a2", courseId: "c2", courseName: "Linear Algebra", title: "Matrix Decomposition Lab", dueDate: "2026-05-29", status: "submitted", points: 80, description: "Implement LU and QR decompositions and test on provided datasets." },
  { id: "a3", courseId: "c3", courseName: "Operating Systems", title: "Thread Synchronization Project", dueDate: "2026-05-28", status: "graded", points: 120, earnedPoints: 108, description: "Implement mutex locks and semaphores in C. Demonstrate deadlock prevention." },
  { id: "a4", courseId: "c5", courseName: "Machine Learning", title: "Neural Network from Scratch", dueDate: "2026-06-05", status: "pending", points: 150, description: "Build a fully connected neural network using only NumPy. Train on MNIST." },
  { id: "a5", courseId: "c4", courseName: "Technical Writing", title: "Project Proposal Document", dueDate: "2026-05-25", status: "late", points: 60, description: "Write a 5-page technical proposal for a software product of your choice." },
  { id: "a6", courseId: "c1", courseName: "Advanced Algorithms", title: "Graph Algorithms Quiz", dueDate: "2026-05-20", status: "graded", points: 50, earnedPoints: 47, description: "Quiz covering BFS, DFS, Dijkstra, and minimum spanning trees." },
  { id: "a7", courseId: "c2", courseName: "Linear Algebra", title: "Eigenvalue Analysis Report", dueDate: "2026-06-10", status: "pending", points: 90, description: "Analyze eigenvalue decomposition on a real-world dataset and present findings." },
  { id: "a8", courseId: "c5", courseName: "Machine Learning", title: "Midterm Exam", dueDate: "2026-05-22", status: "graded", points: 200, earnedPoints: 176, description: "Covers supervised learning, regression, classification, and model evaluation." },
];

const GRADES: GradeEntry[] = [
  { courseId: "c1", courseName: "Advanced Algorithms", courseCode: "CS401", credits: 4, grade: "A", gradePoints: 4.0, semester: "Spring 2026" },
  { courseId: "c2", courseName: "Linear Algebra", courseCode: "MATH301", credits: 3, grade: "A-", gradePoints: 3.7, semester: "Spring 2026" },
  { courseId: "c3", courseName: "Operating Systems", courseCode: "CS350", credits: 4, grade: "B+", gradePoints: 3.3, semester: "Spring 2026" },
  { courseId: "c4", courseName: "Technical Writing", courseCode: "ENG205", credits: 2, grade: "A", gradePoints: 4.0, semester: "Spring 2026" },
  { courseId: "c5", courseName: "Machine Learning", courseCode: "CS420", credits: 4, grade: "B+", gradePoints: 3.3, semester: "Spring 2026" },
  { courseId: "px1", courseName: "Data Structures", courseCode: "CS201", credits: 3, grade: "A", gradePoints: 4.0, semester: "Fall 2025" },
  { courseId: "px2", courseName: "Calculus III", courseCode: "MATH203", credits: 4, grade: "A-", gradePoints: 3.7, semester: "Fall 2025" },
  { courseId: "px3", courseName: "Computer Networks", courseCode: "CS330", credits: 3, grade: "B+", gradePoints: 3.3, semester: "Fall 2025" },
  { courseId: "px4", courseName: "Discrete Mathematics", courseCode: "MATH220", credits: 3, grade: "A", gradePoints: 4.0, semester: "Fall 2025" },
  { courseId: "px5", courseName: "Software Engineering", courseCode: "CS310", credits: 3, grade: "A-", gradePoints: 3.7, semester: "Fall 2025" },
];

const GPA_HISTORY: GPAPoint[] = [
  { semester: "Fall 2023", gpa: 3.2 },
  { semester: "Spring 2024", gpa: 3.5 },
  { semester: "Fall 2024", gpa: 3.6 },
  { semester: "Spring 2025", gpa: 3.7 },
  { semester: "Fall 2025", gpa: 3.75 },
  { semester: "Spring 2026", gpa: 3.6 },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: "ach1", title: "Dean's List", description: "Achieved a GPA of 3.75 or higher for a semester.", icon: "🏆", earned: true, earnedDate: "May 2025", category: "Academic", rarity: "epic" },
  { id: "ach2", title: "Perfect Attendance", description: "Never missed a class for an entire semester.", icon: "📅", earned: true, earnedDate: "Dec 2024", category: "Attendance", rarity: "rare" },
  { id: "ach3", title: "First Submission", description: "Submitted your first assignment on time.", icon: "📝", earned: true, earnedDate: "Sep 2023", category: "Assignments", rarity: "common" },
  { id: "ach4", title: "Honor Roll", description: "Maintained a GPA above 3.5 for two consecutive semesters.", icon: "⭐", earned: true, earnedDate: "Jan 2025", category: "Academic", rarity: "rare" },
  { id: "ach5", title: "Course Completionist", description: "Completed all assignments in a course without any late submissions.", icon: "✅", earned: true, earnedDate: "May 2024", category: "Assignments", rarity: "rare" },
  { id: "ach6", title: "Algorithmist", description: "Scored 95%+ on an algorithms exam.", icon: "🧠", earned: true, earnedDate: "Mar 2026", category: "Exams", rarity: "epic" },
  { id: "ach7", title: "Straight A's", description: "Earn all A grades in a semester.", icon: "🎯", earned: false, category: "Academic", rarity: "legendary" },
  { id: "ach8", title: "Hackathon Hero", description: "Participate in a university hackathon.", icon: "💻", earned: false, category: "Extracurricular", rarity: "rare" },
  { id: "ach9", title: "Research Scholar", description: "Assist a professor in published research.", icon: "🔬", earned: false, category: "Research", rarity: "legendary" },
  { id: "ach10", title: "Team Player", description: "Successfully complete 5 group projects.", icon: "🤝", earned: false, category: "Collaboration", rarity: "common" },
  { id: "ach11", title: "Night Owl", description: "Submit 10 assignments after midnight.", icon: "🦉", earned: true, earnedDate: "Feb 2026", category: "Assignments", rarity: "common" },
  { id: "ach12", title: "Speed Demon", description: "Submit an assignment more than a week early.", icon: "⚡", earned: false, category: "Assignments", rarity: "rare" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function calcGPA(entries: GradeEntry[], semester?: string) {
  const filtered = semester ? entries.filter((e) => e.semester === semester) : entries;
  if (!filtered.length) return 0;
  const totalPoints = filtered.reduce((s, e) => s + e.gradePoints * e.credits, 0);
  const totalCredits = filtered.reduce((s, e) => s + e.credits, 0);
  return totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0;
}

function gradeColor(grade: string) {
  if (grade.startsWith("A")) return "#10b981";
  if (grade.startsWith("B")) return "#6366f1";
  if (grade.startsWith("C")) return "#f59e0b";
  return "#ef4444";
}

function rarityColor(rarity: Achievement["rarity"]) {
  return { common: "#94a3b8", rare: "#6366f1", epic: "#a855f7", legendary: "#f59e0b" }[rarity];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusBadge(status: Assignment["status"]) {
  const map = {
    pending:   { bg: "#dbeafe", color: "#1d4ed8", label: "Pending" },
    submitted: { bg: "#d1fae5", color: "#065f46", label: "Submitted" },
    graded:    { bg: "#f3e8ff", color: "#7e22ce", label: "Graded" },
    late:      { bg: "#fee2e2", color: "#991b1b", label: "Late" },
  };
  return map[status];
}

// ─── GPA CHART ────────────────────────────────────────────────────────────────

function GPAChart({ data }: { data: GPAPoint[] }) {
  const W = 560, H = 200, PAD = 40;
  const minGpa = 2.5, maxGpa = 4.0;
  const xStep = (W - PAD * 2) / (data.length - 1);
  const toX = (i: number) => PAD + i * xStep;
  const toY = (gpa: number) => H - PAD - ((gpa - minGpa) / (maxGpa - minGpa)) * (H - PAD * 2);
  const pathD = data.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.gpa)}`).join(" ");
  const areaD = `${pathD} L ${toX(data.length - 1)} ${H - PAD} L ${toX(0)} ${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[2.5, 3.0, 3.5, 4.0].map((g) => (
        <g key={g}>
          <line x1={PAD} y1={toY(g)} x2={W - PAD} y2={toY(g)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />
          <text x={PAD - 6} y={toY(g) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{g.toFixed(1)}</text>
        </g>
      ))}
      <path d={areaD} fill="url(#gpaGrad)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((p, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(p.gpa)} r="5" fill="#6366f1" stroke="#fff" strokeWidth="2" />
          <text x={toX(i)} y={toY(p.gpa) - 10} textAnchor="middle" fontSize="10" fill="#6366f1" fontWeight="600">{p.gpa}</text>
          <text x={toX(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">
            {p.semester.split(" ")[0].slice(0, 2) + " " + p.semester.split(" ")[1].slice(2)}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("my-courses");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set(ENROLLED_COURSES.map((c) => c.id)));
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("All");
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | Assignment["status"]>("all");
  const [gradeSemester, setGradeSemester] = useState("All");
  const [achievementFilter, setAchievementFilter] = useState<"all" | "earned" | "unearned">("all");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [idCardFlipped, setIdCardFlipped] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── API integration (graceful fallback for dev/offline) ──────────────────
  async function apiEnroll(courseId: string) {
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) throw new Error();
    } catch { /* silently continue */ }
  }

  async function apiDrop(courseId: string) {
    try {
      await fetch("/api/courses/drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
    } catch { /* silently continue */ }
  }

  // ── Enroll / Drop ────────────────────────────────────────────────────────
  async function handleEnroll(course: Course) {
    setEnrolling(course.id);
    if (enrolledIds.has(course.id)) {
      await apiDrop(course.id);
      setEnrolledIds((prev) => { const n = new Set(prev); n.delete(course.id); return n; });
      showToast(`Dropped ${course.code}`, "error");
    } else {
      await apiEnroll(course.id);
      setEnrolledIds((prev) => new Set(prev).add(course.id));
      showToast(`Enrolled in ${course.code}!`);
    }
    setEnrolling(null);
  }

  // ── Photo upload ─────────────────────────────────────────────────────────
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  // ── Derived data ─────────────────────────────────────────────────────────
  const enrolledCourses = ENROLLED_COURSES.filter((c) => enrolledIds.has(c.id));
  const currentGPA = calcGPA(GRADES, "Spring 2026");
  const cumulativeGPA = calcGPA(GRADES);
  const totalCredits = GRADES.reduce((s, g) => s + g.credits, 0);
  const pendingCount = ASSIGNMENTS.filter((a) => a.status === "pending").length;
  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned).length;

  const categories = ["All", ...Array.from(new Set(CATALOG_COURSES.map((c) => c.category)))];
  const filteredCatalog = CATALOG_COURSES.filter((c) => {
    const q = catalogSearch.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
    return matchSearch && (catalogCategory === "All" || c.category === catalogCategory);
  });

  const filteredAssignments = ASSIGNMENTS.filter((a) => assignmentFilter === "all" || a.status === assignmentFilter);
  const semesters = ["All", ...Array.from(new Set(GRADES.map((g) => g.semester)))];
  const filteredGrades = GRADES.filter((g) => gradeSemester === "All" || g.semester === gradeSemester);
  const semesterGPA = gradeSemester === "All" ? cumulativeGPA : calcGPA(GRADES, gradeSemester);
  const filteredAchievements = ACHIEVEMENTS.filter((a) =>
    achievementFilter === "earned" ? a.earned : achievementFilter === "unearned" ? !a.earned : true
  );

  const TAB_LABELS: Record<Tab, string> = {
    "my-courses": "🎓 My Courses",
    catalog: "📖 Catalog",
    assignments: "📝 Assignments",
    grades: "📊 Grades",
    achievements: "🏆 Achievements",
    "id-card": "🪪 ID Card",
  };

  return (
    <div style={styles.page}>
      {/* Toast notification */}
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === "success" ? "#10b981" : "#ef4444" }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>📚 Courses</h1>
          <p style={styles.headerSub}>Welcome back, Jason · Spring 2026 · GPA {currentGPA}</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statBox}><span style={styles.statNum}>{enrolledCourses.length}</span><span style={styles.statLabel}>Enrolled</span></div>
          <div style={styles.statBox}><span style={styles.statNum}>{pendingCount}</span><span style={styles.statLabel}>Due Soon</span></div>
          <div style={styles.statBox}><span style={styles.statNum}>{earnedCount}</span><span style={styles.statLabel}>Badges</span></div>
          <div style={styles.statBox}><span style={styles.statNum}>{totalCredits}</span><span style={styles.statLabel}>Credits</span></div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={styles.tabBar}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button key={t} style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }} onClick={() => setActiveTab(t)}>
            {TAB_LABELS[t]}
            {t === "assignments" && pendingCount > 0 && <span style={styles.badge}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* ══ MY COURSES ══════════════════════════════════════════════════════ */}
        {activeTab === "my-courses" && (
          <div>
            <h2 style={styles.sectionTitle}>My Enrolled Courses</h2>
            <div style={styles.grid}>
              {enrolledCourses.map((course) => (
                <div key={course.id} style={{ ...styles.card, borderTop: `4px solid ${course.color}` }}>
                  <div style={styles.cardHead}>
                    <span style={{ ...styles.codeTag, background: course.color + "22", color: course.color }}>{course.code}</span>
                    <span style={{ ...styles.gradeTag, color: gradeColor(course.grade!) }}>{course.grade}</span>
                  </div>
                  <h3 style={styles.cardTitle}>{course.name}</h3>
                  <p style={styles.cardSub}>{course.instructor}</p>
                  <p style={styles.cardMeta}>🕐 {course.schedule}</p>
                  <p style={styles.cardMeta}>📍 {course.room} · {course.credits} credits</p>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${course.progress}%`, background: course.color }} />
                  </div>
                  <p style={styles.progressLabel}>{course.progress}% complete</p>
                  <button style={{ ...styles.btn, background: course.color }} onClick={() => setSelectedCourse(course)}>View Details</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ CATALOG ═════════════════════════════════════════════════════════ */}
        {activeTab === "catalog" && (
          <div>
            <h2 style={styles.sectionTitle}>Course Catalog</h2>
            <div style={styles.filterRow}>
              <input style={styles.searchInput} placeholder="🔍  Search courses, instructors..." value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} />
              <select style={styles.select} value={catalogCategory} onChange={(e) => setCatalogCategory(e.target.value)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.grid}>
              {filteredCatalog.map((course) => {
                const isEnrolled = enrolledIds.has(course.id);
                const isFull = course.enrolled >= course.capacity && !isEnrolled;
                return (
                  <div key={course.id} style={{ ...styles.card, borderTop: `4px solid ${course.color}` }}>
                    <div style={styles.cardHead}>
                      <span style={{ ...styles.codeTag, background: course.color + "22", color: course.color }}>{course.code}</span>
                      <span style={styles.categoryTag}>{course.category}</span>
                    </div>
                    <h3 style={styles.cardTitle}>{course.name}</h3>
                    <p style={styles.cardSub}>{course.instructor}</p>
                    <p style={styles.cardMeta}>🕐 {course.schedule}</p>
                    <p style={styles.cardMeta}>📍 {course.room} · {course.credits} credits</p>
                    <p style={styles.cardMeta}>👥 {course.enrolled}/{course.capacity} seats</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button style={{ ...styles.btnOutline, borderColor: course.color, color: course.color }} onClick={() => setSelectedCourse(course)}>Details</button>
                      <button
                        disabled={isFull || enrolling === course.id}
                        style={{ ...styles.btn, background: isEnrolled ? "#ef4444" : isFull ? "#94a3b8" : course.color, flex: 1 }}
                        onClick={() => handleEnroll(course)}>
                        {enrolling === course.id ? "…" : isEnrolled ? "Drop" : isFull ? "Full" : "Enroll"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ ASSIGNMENTS ═════════════════════════════════════════════════════ */}
        {activeTab === "assignments" && (
          <div>
            <h2 style={styles.sectionTitle}>Assignments</h2>
            <div style={styles.filterRow}>
              {(["all", "pending", "submitted", "graded", "late"] as const).map((f) => (
                <button key={f} style={{ ...styles.filterBtn, ...(assignmentFilter === f ? styles.filterBtnActive : {}) }} onClick={() => setAssignmentFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div style={styles.list}>
              {filteredAssignments.map((a) => {
                const badge = statusBadge(a.status);
                return (
                  <div key={a.id} style={styles.listItem} onClick={() => setSelectedAssignment(a)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ ...styles.statusBadge, background: badge.bg, color: badge.color }}>{badge.label}</span>
                        <span style={styles.courseChip}>{a.courseName}</span>
                      </div>
                      <h3 style={styles.listTitle}>{a.title}</h3>
                      <p style={styles.listMeta}>Due: {formatDate(a.dueDate)} · {a.points} pts{a.earnedPoints !== undefined ? ` · Earned: ${a.earnedPoints}` : ""}</p>
                    </div>
                    <span style={styles.chevron}>›</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ GRADES ══════════════════════════════════════════════════════════ */}
        {activeTab === "grades" && (
          <div>
            <h2 style={styles.sectionTitle}>Grades & GPA</h2>
            <div style={styles.gpaCards}>
              <div style={styles.gpaCard}><span style={styles.gpaNum}>{currentGPA}</span><span style={styles.gpaLabel}>Spring 2026 GPA</span></div>
              <div style={styles.gpaCard}><span style={styles.gpaNum}>{cumulativeGPA}</span><span style={styles.gpaLabel}>Cumulative GPA</span></div>
              <div style={styles.gpaCard}><span style={styles.gpaNum}>{totalCredits}</span><span style={styles.gpaLabel}>Total Credits</span></div>
            </div>
            <div style={styles.chartBox}>
              <h3 style={styles.chartTitle}>GPA Trend</h3>
              <GPAChart data={GPA_HISTORY} />
            </div>
            <div style={{ ...styles.filterRow, marginTop: 24 }}>
              <label style={styles.label}>Semester:</label>
              <select style={styles.select} value={gradeSemester} onChange={(e) => setGradeSemester(e.target.value)}>
                {semesters.map((s) => <option key={s}>{s}</option>)}
              </select>
              <span style={styles.gpaSmall}>Semester GPA: <strong>{semesterGPA}</strong></span>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>{["Course", "Code", "Credits", "Grade", "Grade Points"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredGrades.map((g) => (
                  <tr key={g.courseId} style={styles.tr}>
                    <td style={styles.td}>{g.courseName}</td>
                    <td style={styles.td}><span style={styles.codeTagSm}>{g.courseCode}</span></td>
                    <td style={styles.td}>{g.credits}</td>
                    <td style={styles.td}><span style={{ ...styles.gradeTag, color: gradeColor(g.grade), fontSize: 14 }}>{g.grade}</span></td>
                    <td style={styles.td}>{g.gradePoints.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ ACHIEVEMENTS ════════════════════════════════════════════════════ */}
        {activeTab === "achievements" && (
          <div>
            <h2 style={styles.sectionTitle}>
              Achievements <span style={styles.achieveCount}>{earnedCount}/{ACHIEVEMENTS.length} earned</span>
            </h2>
            <div style={styles.filterRow}>
              {(["all", "earned", "unearned"] as const).map((f) => (
                <button key={f} style={{ ...styles.filterBtn, ...(achievementFilter === f ? styles.filterBtnActive : {}) }} onClick={() => setAchievementFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div style={styles.achGrid}>
              {filteredAchievements.map((a) => (
                <div key={a.id} style={{ ...styles.achCard, opacity: a.earned ? 1 : 0.45, borderColor: a.earned ? rarityColor(a.rarity) : "#e2e8f0" }}>
                  <div style={{ ...styles.achIcon, background: a.earned ? rarityColor(a.rarity) + "22" : "#f1f5f9" }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h3 style={styles.achTitle}>{a.title}</h3>
                      <span style={{ ...styles.rarityTag, color: rarityColor(a.rarity) }}>{a.rarity}</span>
                    </div>
                    <p style={styles.achDesc}>{a.description}</p>
                    {a.earned && a.earnedDate && <p style={styles.achDate}>🗓 Earned {a.earnedDate}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ID CARD ═════════════════════════════════════════════════════════ */}
        {activeTab === "id-card" && (
          <div style={styles.idSection}>
            <h2 style={styles.sectionTitle}>Student ID Card</h2>
            <div style={styles.idCardWrap} onClick={() => setIdCardFlipped((f) => !f)}>
              {!idCardFlipped ? (
                <div style={styles.idCard}>
                  <div style={styles.idCardHeader}>
                    <span style={styles.idUniversity}>🎓 Copilot University</span>
                    <span style={styles.idSemester}>Spring 2026</span>
                  </div>
                  <div style={styles.idCardBody}>
                    <div style={styles.idPhotoWrap}>
                      {photoUrl
                        ? <img src={photoUrl} alt="Student photo" style={styles.idPhoto} />
                        : <div style={styles.idPhotoPlaceholder}>👤</div>}
                    </div>
                    <div style={styles.idInfo}>
                      <p style={styles.idName}>Jason Fotta</p>
                      <p style={styles.idDetail}>ID: CU-2026-4892</p>
                      <p style={styles.idDetail}>Major: Computer Science</p>
                      <p style={styles.idDetail}>Year: Junior</p>
                      <p style={styles.idDetail}>GPA: {cumulativeGPA}</p>
                    </div>
                  </div>
                  <div style={styles.idCardFooter}>
                    <div style={styles.barcode}>▌▌▐▌▌▐▐▌▐▌▌▐▌▐▐▌▌▐▌▌</div>
                  </div>
                </div>
              ) : (
                <div style={{ ...styles.idCard, background: "#1e293b" }}>
                  <div style={styles.idCardBackStrip} />
                  <div style={styles.idCardBackContent}>
                    <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>
                      This card is property of Copilot University. If found, please return to the registrar.
                    </p>
                    <p style={{ color: "#fff", fontSize: 13, marginBottom: 4 }}>Emergency Contact: (484) 555-0192</p>
                    <p style={{ color: "#94a3b8", fontSize: 11 }}>Valid for: 2025–2026 Academic Year</p>
                  </div>
                </div>
              )}
            </div>
            <p style={styles.idHint}>Click card to flip · Upload your photo below</p>
            <div style={styles.uploadRow}>
              <button style={styles.uploadBtn} onClick={() => photoRef.current?.click()}>📷 Upload Photo</button>
              <input ref={photoRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              {photoUrl && (
                <button style={{ ...styles.uploadBtn, background: "#ef4444" }} onClick={() => setPhotoUrl(null)}>Remove Photo</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ COURSE DETAIL MODAL ═════════════════════════════════════════════ */}
      <Modal open={!!selectedCourse} onClose={() => setSelectedCourse(null)} title={selectedCourse?.name ?? ""}>
        {selectedCourse && (
          <div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ ...styles.codeTag, background: selectedCourse.color + "22", color: selectedCourse.color }}>{selectedCourse.code}</span>
              <span style={styles.categoryTag}>{selectedCourse.category}</span>
              <span style={styles.categoryTag}>{selectedCourse.credits} credits</span>
            </div>
            <p style={styles.modalDesc}>{selectedCourse.description}</p>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}><span style={styles.detailLabel}>Instructor</span><span>{selectedCourse.instructor}</span></div>
              <div style={styles.detailItem}><span style={styles.detailLabel}>Schedule</span><span>{selectedCourse.schedule}</span></div>
              <div style={styles.detailItem}><span style={styles.detailLabel}>Room</span><span>{selectedCourse.room}</span></div>
              <div style={styles.detailItem}><span style={styles.detailLabel}>Enrollment</span><span>{selectedCourse.enrolled}/{selectedCourse.capacity}</span></div>
              {selectedCourse.grade && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Current Grade</span>
                  <span style={{ color: gradeColor(selectedCourse.grade), fontWeight: 700 }}>{selectedCourse.grade}</span>
                </div>
              )}
            </div>
            {enrolledIds.has(selectedCourse.id) ? (
              <button style={{ ...styles.btn, background: "#ef4444", marginTop: 16 }}
                onClick={() => { handleEnroll(selectedCourse); setSelectedCourse(null); }}>Drop Course</button>
            ) : (
              <button style={{ ...styles.btn, background: selectedCourse.color, marginTop: 16 }}
                onClick={() => { handleEnroll(selectedCourse); setSelectedCourse(null); }}>Enroll</button>
            )}
          </div>
        )}
      </Modal>

      {/* ══ ASSIGNMENT DETAIL MODAL ═════════════════════════════════════════ */}
      <Modal open={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} title={selectedAssignment?.title ?? ""}>
        {selectedAssignment && (() => {
          const badge = statusBadge(selectedAssignment.status);
          return (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <span style={{ ...styles.statusBadge, background: badge.bg, color: badge.color }}>{badge.label}</span>
                <span style={styles.courseChip}>{selectedAssignment.courseName}</span>
              </div>
              <p style={styles.modalDesc}>{selectedAssignment.description}</p>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}><span style={styles.detailLabel}>Due Date</span><span>{formatDate(selectedAssignment.dueDate)}</span></div>
                <div style={styles.detailItem}><span style={styles.detailLabel}>Total Points</span><span>{selectedAssignment.points}</span></div>
                {selectedAssignment.earnedPoints !== undefined && (
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Score</span>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>
                      {selectedAssignment.earnedPoints}/{selectedAssignment.points} ({Math.round(selectedAssignment.earnedPoints / selectedAssignment.points * 100)}%)
                    </span>
                  </div>
                )}
              </div>
              {selectedAssignment.status === "pending" && (
                <button style={{ ...styles.btn, background: "#6366f1", marginTop: 16 }}
                  onClick={() => { showToast("Assignment submitted!"); setSelectedAssignment(null); }}>
                  Submit Assignment
                </button>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif", color: "#1e293b" },
  header: { background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", color: "#fff", padding: "32px 32px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
  headerTitle: { fontSize: 28, fontWeight: 800, margin: 0 },
  headerSub: { fontSize: 14, opacity: 0.85, marginTop: 4 },
  headerStats: { display: "flex", gap: 16 },
  statBox: { background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 20px", textAlign: "center", display: "flex", flexDirection: "column" },
  statNum: { fontSize: 22, fontWeight: 800 },
  statLabel: { fontSize: 11, opacity: 0.8, marginTop: 2 },
  tabBar: { display: "flex", gap: 4, padding: "0 32px", background: "#fff", borderBottom: "1px solid #e2e8f0", overflowX: "auto" },
  tab: { padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#64748b", borderBottom: "3px solid transparent", whiteSpace: "nowrap", position: "relative", transition: "all .15s" },
  tabActive: { color: "#6366f1", borderBottomColor: "#6366f1", fontWeight: 700 },
  badge: { background: "#ef4444", color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 6px", marginLeft: 6, verticalAlign: "middle" },
  content: { padding: "28px 32px", maxWidth: 1200, margin: "0 auto" },
  sectionTitle: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#0f172a" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 },
  card: { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  codeTag: { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 },
  categoryTag: { fontSize: 11, fontWeight: 600, background: "#f1f5f9", color: "#64748b", padding: "3px 10px", borderRadius: 99 },
  gradeTag: { fontSize: 16, fontWeight: 800 },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 4, color: "#0f172a" },
  cardSub: { fontSize: 13, color: "#64748b", marginBottom: 8 },
  cardMeta: { fontSize: 12, color: "#94a3b8", marginBottom: 3 },
  progressBar: { height: 6, background: "#f1f5f9", borderRadius: 99, margin: "12px 0 4px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, transition: "width .3s" },
  progressLabel: { fontSize: 11, color: "#94a3b8", marginBottom: 12 },
  btn: { border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, width: "100%" },
  btnOutline: { border: "1.5px solid", borderRadius: 8, padding: "8px 14px", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  filterRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  searchInput: { flex: 1, minWidth: 220, padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" },
  select: { padding: "9px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, background: "#fff", cursor: "pointer" },
  filterBtn: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  filterBtnActive: { background: "#6366f1", color: "#fff", borderColor: "#6366f1" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  listItem: { background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 },
  listTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 },
  listMeta: { fontSize: 12, color: "#94a3b8" },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 },
  courseChip: { fontSize: 11, background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: 99, fontWeight: 600 },
  chevron: { fontSize: 22, color: "#cbd5e1", fontWeight: 300 },
  gpaCards: { display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  gpaCard: { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 14, padding: "20px 32px", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 140 },
  gpaNum: { fontSize: 36, fontWeight: 900 },
  gpaLabel: { fontSize: 12, opacity: 0.85, marginTop: 4 },
  gpaSmall: { fontSize: 14, color: "#64748b" },
  chartBox: { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 8 },
  chartTitle: { fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#0f172a" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  th: { background: "#f8fafc", padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 16px", fontSize: 14, color: "#1e293b" },
  codeTagSm: { fontSize: 11, fontWeight: 700, background: "#e0e7ff", color: "#6366f1", padding: "2px 8px", borderRadius: 99 },
  label: { fontSize: 13, fontWeight: 600, color: "#475569" },
  achieveCount: { fontSize: 14, fontWeight: 500, color: "#94a3b8", marginLeft: 8 },
  achGrid: { display: "flex", flexDirection: "column", gap: 12 },
  achCard: { background: "#fff", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1.5px solid" },
  achIcon: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 },
  achTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 },
  rarityTag: { fontSize: 10, fontWeight: 700, textTransform: "uppercase" },
  achDesc: { fontSize: 13, color: "#64748b", marginTop: 4 },
  achDate: { fontSize: 11, color: "#94a3b8", marginTop: 4 },
  idSection: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20 },
  idCardWrap: { cursor: "pointer", userSelect: "none", marginBottom: 16 },
  idCard: { width: 340, borderRadius: 16, background: "#fff", boxShadow: "0 8px 32px rgba(99,102,241,0.18)", overflow: "hidden" },
  idCardHeader: { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  idUniversity: { color: "#fff", fontWeight: 800, fontSize: 14 },
  idSemester: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  idCardBody: { padding: 20, display: "flex", gap: 16, alignItems: "center" },
  idPhotoWrap: { width: 72, height: 90, borderRadius: 10, overflow: "hidden", border: "2px solid #e2e8f0", flexShrink: 0 },
  idPhoto: { width: "100%", height: "100%", objectFit: "cover" },
  idPhotoPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: "#f1f5f9" },
  idInfo: { flex: 1 },
  idName: { fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 6 },
  idDetail: { fontSize: 12, color: "#64748b", marginBottom: 3 },
  idCardFooter: { padding: "10px 20px 14px", borderTop: "1px solid #f1f5f9" },
  barcode: { fontSize: 14, letterSpacing: 2, color: "#1e293b", fontFamily: "monospace" },
  idCardBackStrip: { height: 44, background: "#334155", marginTop: 20 },
  idCardBackContent: { padding: 20 },
  idHint: { fontSize: 12, color: "#94a3b8", marginBottom: 16 },
  uploadRow: { display: "flex", gap: 10 },
  uploadBtn: { background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modal: { background: "#fff", borderRadius: 16, maxWidth: 520, width: "100%", maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 0" },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 },
  closeBtn: { background: "#f1f5f9", border: "none", borderRadius: 99, width: 32, height: 32, cursor: "pointer", fontSize: 14, color: "#64748b" },
  modalBody: { padding: "16px 24px 24px" },
  modalDesc: { fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 16 },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  detailItem: { background: "#f8fafc", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 2 },
  detailLabel: { fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" },
  toast: { position: "fixed", bottom: 24, right: 24, color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", zIndex: 2000 },
};
