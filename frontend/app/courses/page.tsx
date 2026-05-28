"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

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

      <div style={styles.shell}>
        <div style={styles.topbar}>
          <div style={styles.brand}>
            <img src="/dr-botonic.jpeg" alt="Dr. Botnotic" style={styles.brandImage} />
            <div style={styles.brandTitle}>
              <b>Botnology101</b>
              <span>Dr. Botnotic • Courses & Progress</span>
            </div>
          </div>
          <nav style={styles.nav} aria-label="Primary">
            <Link href="/" style={styles.navLink}>Home</Link>
            <Link href="/dashboard" style={styles.navLink}>Dashboard</Link>
            <Link href="/study-hall" style={styles.navLink}>Study Hall</Link>
            <Link href="/tutor" style={styles.navLink}>AI Tutor</Link>
            <Link href="/login" style={{ ...styles.navLink, ...styles.navLinkGold }}>Sign In</Link>
          </nav>
        </div>

        <div style={styles.hero}>
          <div>
            <div style={styles.eyebrow}>Premium student portal</div>
            <h1 style={styles.heroTitle}>Courses that feel like the rest of Botnology101.</h1>
            <p style={styles.heroSub}>
              Track classes, grades, assignments, and achievements in a branded portal that matches the
              original Botnology101 experience instead of a stock dashboard.
            </p>
            <div style={styles.heroActions}>
              <Link href="/" style={{ ...styles.heroButton, ...styles.heroButtonGold }}>Back to Home</Link>
              <Link href="/dashboard" style={styles.heroButton}>Open Dashboard</Link>
            </div>
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
                      <span style={styles.idUniversity}>🎓 Botnology101</span>
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
                      <p style={styles.idDetail}>ID: BN-2026-4892</p>
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
                  <div style={{ ...styles.idCard, background: "#1e2d22" }}>
                  <div style={styles.idCardBackStrip} />
                  <div style={styles.idCardBackContent}>
                    <p style={{ color: "#d7e3dd", fontSize: 12, marginBottom: 8 }}>
                      This card is property of Botnology101. If found, please return to the registrar.
                    </p>
                    <p style={{ color: "#fff", fontSize: 13, marginBottom: 4 }}>Emergency Contact: (484) 555-0192</p>
                    <p style={{ color: "#b8c6c0", fontSize: 11 }}>Valid for: 2025–2026 Academic Year</p>
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
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1000px 700px at 20% 10%, rgba(191,230,208,.12), transparent 55%), radial-gradient(900px 600px at 80% 0%, rgba(214,182,107,.12), transparent 60%), linear-gradient(180deg, #07140e 0%, #0b1a12 45%, #07140e 100%)",
    color: "#f8f3e7",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  shell: { maxWidth: 1440, margin: "0 auto", padding: "24px 18px 72px" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: 14, border: "1px solid rgba(214,182,107,.22)", background: "rgba(8,20,14,.82)", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,.28)", backdropFilter: "blur(14px)" },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandImage: { width: 48, height: 48, borderRadius: 999, border: "1px solid rgba(214,182,107,.32)", objectFit: "cover", background: "#0a1811" },
  brandTitle: { display: "flex", flexDirection: "column", lineHeight: 1.05 },
  nav: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  navLink: { padding: "9px 12px", borderRadius: 14, border: "1px solid rgba(214,182,107,.16)", color: "#e8f3ee", textDecoration: "none", fontSize: 13, fontWeight: 650, background: "rgba(255,255,255,.03)" },
  navLinkGold: { background: "linear-gradient(135deg, #d6b667, #b99644)", color: "#08120d", borderColor: "rgba(214,182,107,.36)" },
  hero: { display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, .9fr)", gap: 18, marginTop: 18, padding: 24, borderRadius: 22, border: "1px solid rgba(214,182,107,.18)", background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))", boxShadow: "0 20px 60px rgba(0,0,0,.24)" },
  eyebrow: { color: "#d6b667", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12, fontWeight: 700, marginBottom: 10 },
  heroTitle: { margin: 0, fontSize: "clamp(34px, 4vw, 58px)", lineHeight: 1.04, letterSpacing: "-0.04em", maxWidth: "12ch" },
  heroSub: { marginTop: 14, maxWidth: 760, color: "#d7e3dd", fontSize: 15, lineHeight: 1.7 },
  heroActions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 },
  heroButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "11px 14px", borderRadius: 14, border: "1px solid rgba(214,182,107,.18)", background: "rgba(255,255,255,.04)", color: "#f8f3e7", fontWeight: 700, textDecoration: "none" },
  heroButtonGold: { background: "linear-gradient(135deg, #d6b667, #b99644)", color: "#08120d" },
  headerStats: { display: "grid", gridTemplateColumns: "repeat(2, minmax(120px, 1fr))", gap: 12, alignContent: "start" },
  statBox: { background: "rgba(5, 13, 9, .65)", border: "1px solid rgba(214,182,107,.16)", borderRadius: 16, padding: "14px 16px", textAlign: "center", display: "flex", flexDirection: "column" },
  statNum: { fontSize: 24, fontWeight: 800, color: "#f3d78a" },
  statLabel: { fontSize: 11, opacity: 0.82, marginTop: 2, color: "#d7e3dd" },
  tabBar: { display: "flex", gap: 6, padding: "14px 2px 0", overflowX: "auto", position: "sticky", top: 12, zIndex: 20, backdropFilter: "blur(12px)" },
  tab: { padding: "13px 18px", border: "1px solid rgba(214,182,107,.14)", background: "rgba(7,20,14,.72)", cursor: "pointer", fontSize: 14, fontWeight: 650, color: "#c8d5ce", borderRadius: 999, whiteSpace: "nowrap", position: "relative", transition: "all .15s" },
  tabActive: { color: "#08120d", background: "linear-gradient(135deg, #d6b667, #b99644)", borderColor: "rgba(214,182,107,.35)" },
  badge: { background: "#8d4b3b", color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 6px", marginLeft: 6, verticalAlign: "middle" },
  content: { padding: "24px 2px 0", maxWidth: 1440, margin: "0 auto" },
  sectionTitle: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#f8f3e7" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 },
  card: { background: "rgba(8,20,14,.76)", border: "1px solid rgba(214,182,107,.15)", borderRadius: 18, padding: 20, boxShadow: "0 18px 40px rgba(0,0,0,.18)" },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  codeTag: { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 },
  categoryTag: { fontSize: 11, fontWeight: 600, background: "rgba(214,182,107,.12)", color: "#d7e3dd", padding: "3px 10px", borderRadius: 99 },
  gradeTag: { fontSize: 16, fontWeight: 800 },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 4, color: "#f8f3e7" },
  cardSub: { fontSize: 13, color: "#b8c6c0", marginBottom: 8 },
  cardMeta: { fontSize: 12, color: "#8f9f98", marginBottom: 3 },
  progressBar: { height: 6, background: "rgba(255,255,255,.08)", borderRadius: 99, margin: "12px 0 4px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, transition: "width .3s" },
  progressLabel: { fontSize: 11, color: "#8f9f98", marginBottom: 12 },
  btn: { border: "none", borderRadius: 10, padding: "9px 18px", color: "#08120d", fontWeight: 700, cursor: "pointer", fontSize: 13, width: "100%" },
  btnOutline: { border: "1.5px solid", borderRadius: 10, padding: "8px 14px", background: "transparent", color: "#e8f3ee", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  filterRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  searchInput: { flex: 1, minWidth: 220, padding: "10px 14px", borderRadius: 12, border: "1.5px solid rgba(214,182,107,.16)", fontSize: 13, outline: "none", background: "rgba(5,13,9,.72)", color: "#f8f3e7" },
  select: { padding: "9px 14px", borderRadius: 12, border: "1.5px solid rgba(214,182,107,.16)", fontSize: 13, background: "rgba(5,13,9,.72)", color: "#f8f3e7", cursor: "pointer" },
  filterBtn: { padding: "8px 16px", borderRadius: 999, border: "1.5px solid rgba(214,182,107,.18)", background: "rgba(255,255,255,.03)", color: "#d7e3dd", fontWeight: 650, cursor: "pointer", fontSize: 13 },
  filterBtnActive: { background: "linear-gradient(135deg, #d6b667, #b99644)", color: "#08120d", borderColor: "rgba(214,182,107,.35)" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  listItem: { background: "rgba(8,20,14,.76)", border: "1px solid rgba(214,182,107,.14)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 14px 34px rgba(0,0,0,.16)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 },
  listTitle: { fontSize: 15, fontWeight: 700, color: "#f8f3e7", marginBottom: 4 },
  listMeta: { fontSize: 12, color: "#8f9f98" },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 },
  courseChip: { fontSize: 11, background: "rgba(214,182,107,.12)", color: "#d7e3dd", padding: "3px 10px", borderRadius: 99, fontWeight: 600 },
  chevron: { fontSize: 22, color: "#d6b667", fontWeight: 300 },
  gpaCards: { display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  gpaCard: { background: "linear-gradient(135deg, rgba(214,182,107,.95), rgba(185,150,68,.95))", borderRadius: 16, padding: "20px 32px", color: "#08120d", display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 140 },
  gpaNum: { fontSize: 36, fontWeight: 900 },
  gpaLabel: { fontSize: 12, opacity: 0.85, marginTop: 4 },
  gpaSmall: { fontSize: 14, color: "#d7e3dd" },
  chartBox: { background: "rgba(8,20,14,.76)", borderRadius: 16, padding: 20, boxShadow: "0 14px 34px rgba(0,0,0,.16)", marginBottom: 8, border: "1px solid rgba(214,182,107,.14)" },
  chartTitle: { fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#f8f3e7" },
  table: { width: "100%", borderCollapse: "collapse", background: "rgba(8,20,14,.76)", borderRadius: 16, overflow: "hidden", boxShadow: "0 14px 34px rgba(0,0,0,.16)", border: "1px solid rgba(214,182,107,.14)" },
  th: { background: "rgba(255,255,255,.03)", padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#d7e3dd", borderBottom: "1px solid rgba(214,182,107,.12)" },
  tr: { borderBottom: "1px solid rgba(214,182,107,.08)" },
  td: { padding: "12px 16px", fontSize: 14, color: "#f8f3e7" },
  codeTagSm: { fontSize: 11, fontWeight: 700, background: "rgba(214,182,107,.12)", color: "#d6b667", padding: "2px 8px", borderRadius: 99 },
  label: { fontSize: 13, fontWeight: 600, color: "#d7e3dd" },
  achieveCount: { fontSize: 14, fontWeight: 500, color: "#8f9f98", marginLeft: 8 },
  achGrid: { display: "flex", flexDirection: "column", gap: 12 },
  achCard: { background: "rgba(8,20,14,.76)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14, boxShadow: "0 14px 34px rgba(0,0,0,.14)", border: "1.5px solid" },
  achIcon: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 },
  achTitle: { fontSize: 15, fontWeight: 700, color: "#f8f3e7", margin: 0 },
  rarityTag: { fontSize: 10, fontWeight: 700, textTransform: "uppercase" },
  achDesc: { fontSize: 13, color: "#b8c6c0", marginTop: 4 },
  achDate: { fontSize: 11, color: "#8f9f98", marginTop: 4 },
  idSection: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20 },
  idCardWrap: { cursor: "pointer", userSelect: "none", marginBottom: 16 },
  idCard: { width: 340, borderRadius: 18, background: "rgba(8,20,14,.96)", boxShadow: "0 18px 42px rgba(0,0,0,.22)", overflow: "hidden", border: "1px solid rgba(214,182,107,.16)" },
  idCardHeader: { background: "linear-gradient(135deg, #d6b667, #b99644)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  idUniversity: { color: "#08120d", fontWeight: 800, fontSize: 14 },
  idSemester: { color: "rgba(8,18,13,0.75)", fontSize: 12 },
  idCardBody: { padding: 20, display: "flex", gap: 16, alignItems: "center" },
  idPhotoWrap: { width: 72, height: 90, borderRadius: 10, overflow: "hidden", border: "2px solid rgba(214,182,107,.2)", flexShrink: 0 },
  idPhoto: { width: "100%", height: "100%", objectFit: "cover" },
  idPhotoPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: "rgba(255,255,255,.03)" },
  idInfo: { flex: 1 },
  idName: { fontSize: 17, fontWeight: 800, color: "#f8f3e7", marginBottom: 6 },
  idDetail: { fontSize: 12, color: "#b8c6c0", marginBottom: 3 },
  idCardFooter: { padding: "10px 20px 14px", borderTop: "1px solid rgba(214,182,107,.12)" },
  barcode: { fontSize: 14, letterSpacing: 2, color: "#d6b667", fontFamily: "monospace" },
  idCardBackStrip: { height: 44, background: "#2b3f32", marginTop: 20 },
  idCardBackContent: { padding: 20 },
  idHint: { fontSize: 12, color: "#8f9f98", marginBottom: 16 },
  uploadRow: { display: "flex", gap: 10 },
  uploadBtn: { background: "#d6b667", color: "#08120d", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modal: { background: "#08120d", borderRadius: 18, maxWidth: 520, width: "100%", maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.32)", border: "1px solid rgba(214,182,107,.16)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 0" },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#f8f3e7", margin: 0 },
  closeBtn: { background: "rgba(255,255,255,.06)", border: "1px solid rgba(214,182,107,.14)", borderRadius: 99, width: 32, height: 32, cursor: "pointer", fontSize: 14, color: "#d7e3dd" },
  modalBody: { padding: "16px 24px 24px" },
  modalDesc: { fontSize: 14, color: "#d7e3dd", lineHeight: 1.6, marginBottom: 16 },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  detailItem: { background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 2, border: "1px solid rgba(214,182,107,.12)" },
  detailLabel: { fontSize: 11, fontWeight: 600, color: "#8f9f98", textTransform: "uppercase" },
  toast: { position: "fixed", bottom: 24, right: 24, color: "#08120d", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, boxShadow: "0 14px 40px rgba(0,0,0,0.22)", zIndex: 2000 },
};
