import { Button } from "@/components/ui/button";

<Button className="mt-6">Test ShadCN</Button>

export default function Page() {
  return (
    <main
      style={{
        padding: "60px 40px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.6,
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: 700,
          marginBottom: "20px",
        }}
      >
        Botnology101
      </h1>

      <p
        style={{
          fontSize: "1.3rem",
          opacity: 0.85,
          marginBottom: "40px",
        }}
      >
        Your AI tutoring platform — built for elite learners who want clarity,
        speed, and mastery. Powered by Dr. Botonic, your 24/7 personal academic
        mentor.
      </p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "60px",
        }}
      >
        <a
          href="/dashboard"
          style={{
            padding: "14px 26px",
            background: "black",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Enter Dashboard
        </a>

        <a
          href="/learn-more"
          style={{
            padding: "14px 26px",
            background: "#f2f2f2",
            color: "black",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Learn More
        </a>
      </div>

      <section style={{ marginBottom: "60px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>
          Why Botnology101?
        </h2>
        <ul style={{ fontSize: "1.1rem", opacity: 0.9 }}>
          <li>Instant explanations for any topic</li>
          <li>Personalized study plans</li>
          <li>Exam prep with adaptive difficulty</li>
          <li>Upload notes, PDFs, and assignments</li>
          <li>Chat with Dr. Botonic — your AI professor</li>
        </ul>
      </section>

      <section style={{ marginBottom: "60px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>
          Built for Ambitious Students
        </h2>
        <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
          Whether you're studying at Harvard, Yale, or grinding through late‑night
          problem sets at home, Botnology101 gives you the clarity and confidence
          to master any subject.
        </p>
      </section>

      <footer
        style={{
          marginTop: "80px",
          paddingTop: "40px",
          borderTop: "1px solid #e5e5e5",
          opacity: 0.7,
          fontSize: "0.9rem",
        }}
      >
        © {new Date().getFullYear()} Botnology101 — All Rights Reserved.
      </footer>
    </main>
  );
}
