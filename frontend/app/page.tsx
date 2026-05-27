import Link from "next/link";

export default function Home() {
  return (
    <div className="container">

      {/* ── Top Navigation Bar ── */}
      <div className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="Botnology101" />
          <div className="title">
            <b>Botnology101</b>
            <span>AI Tutoring Platform</span>
          </div>
        </div>
        <nav className="nav">
          <Link href="/dashboard"  className="btn small">Dashboard</Link>
          <Link href="/courses"    className="btn small">Courses</Link>
          <Link href="/study-hall" className="btn small">Study Hall</Link>
          <Link href="/tutor"      className="btn small">AI Tutor</Link>
          <Link href="/chat"       className="btn small">Chat</Link>
          <Link href="/login"      className="btn gold small">Sign In</Link>
        </nav>
      </div>

      {/* ── Hero ── */}
      <div className="hero">
        <div>
          <span className="h-eyebrow">🤖 Powered by Advanced AI</span>
          <h1 className="h1">Learn Smarter.<br />Achieve More.</h1>
          <p className="sub">
            Botnology101 is your personal AI tutoring platform — built for elite learners
            who want real results. Get instant answers, personalized study plans, and 24/7
            AI-powered support across every subject.
          </p>
          <div style={{ display:"flex", gap:"10px", marginTop:"20px", flexWrap:"wrap" }}>
            <Link href="/dashboard" className="btn gold">Enter Dashboard →</Link>
            <Link href="/courses"   className="btn">Browse Courses</Link>
          </div>
          <div className="hr" style={{ marginTop:"24px" }} />
          <div className="grid2" style={{ marginTop:"16px" }}>
            <div className="kpi"><b>10,000+</b><span>Students enrolled across all courses</span></div>
            <div className="kpi"><b>98%</b><span>Pass rate among daily AI tutor users</span></div>
            <div className="kpi"><b>24 / 7</b><span>Always-on AI support, any subject</span></div>
            <div className="kpi"><b>50+ Courses</b><span>From beginner to advanced mastery</span></div>
          </div>
        </div>

        <div>
          <div id="dr-botonic-photo">
            <h2>Meet Dr. Botonic</h2>
            <p className="sub">
              Your AI professor — always on, always ready to help you master any subject
              with personalized explanations, instant feedback, and adaptive quizzing.
            </p>
            <div style={{ marginTop:"16px" }}>
              <span className="badge"><span className="dot" />Online Now</span>
            </div>
            <div style={{ display:"flex", gap:"8px", marginTop:"16px", flexWrap:"wrap" }}>
              <Link href="/tutor" className="btn gold small">Start Tutoring →</Link>
              <Link href="/chat"  className="btn small">Open Chat</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div id="exciting-features">
        <h2>Why Botnology101?</h2>
        <div className="grid2" style={{ marginTop:"16px" }}>
          <div className="card"><b>🧠 Adaptive AI Tutor</b><p className="sub" style={{ marginTop:"8px" }}>Our AI adjusts explanations, pacing, and difficulty in real time to fit your unique learning style.</p></div>
          <div className="card"><b>📚 Curated Course Catalog</b><p className="sub" style={{ marginTop:"8px" }}>50+ expert-built courses across math, science, coding, and more — with projects, assignments, and graded assessments.</p></div>
          <div className="card"><b>📊 Real-Time Progress Tracking</b><p className="sub" style={{ marginTop:"8px" }}>Watch your grades, streaks, and mastery scores update live. Always know where you stand.</p></div>
          <div className="card"><b>🏆 Achievements &amp; Rewards</b><p className="sub" style={{ marginTop:"8px" }}>Earn badges, climb leaderboards, and celebrate every milestone. Learning is designed to feel like winning.</p></div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="hero-black" style={{ textAlign:"center" }}>
        <h2 className="h1" style={{ fontSize:"28px" }}>Built for Ambitious Students</h2>
        <p className="sub" style={{ maxWidth:"52ch", margin:"12px auto 0" }}>
          Whether you&apos;re studying for finals, learning to code, or mastering advanced theory —
          Botnology101 gives you the AI edge that top students rely on.
        </p>
        <div style={{ display:"flex", gap:"10px", marginTop:"24px", justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/login"   className="btn gold">Get Started Free →</Link>
          <Link href="/courses" className="btn">Explore Courses</Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="hr" style={{ marginTop:"48px" }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 0", flexWrap:"wrap", gap:"12px" }}>
        <span className="smallmuted">© 2026 Botnology101 · All rights reserved</span>
        <div style={{ display:"flex", gap:"16px" }}>
          <Link href="/courses"   style={{ color:"var(--mint)", fontSize:"13px" }}>Courses</Link>
          <Link href="/dashboard" style={{ color:"var(--mint)", fontSize:"13px" }}>Dashboard</Link>
          <Link href="/tutor"     style={{ color:"var(--mint)", fontSize:"13px" }}>AI Tutor</Link>
          <Link href="/login"     style={{ color:"var(--mint)", fontSize:"13px" }}>Sign In</Link>
        </div>
      </div>

    </div>
  );
}
