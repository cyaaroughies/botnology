import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Botnology101
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI tutoring platform — built for elite learners who want clarity,
          speed, and mastery. Powered by Dr. Botonic, your 24/7 personal academic
          mentor.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg" className="px-8">
            Enter Dashboard
          </Button>

          <Button size="lg" variant="outline" className="px-8">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Why Botnology101?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-lg text-muted-foreground">
          <div className="p-6 rounded-xl border bg-card">
            Instant explanations for any topic
          </div>
          <div className="p-6 rounded-xl border bg-card">
            Personalized study plans
          </div>
          <div className="p-6 rounded-xl border bg-card">
            Exam prep with adaptive difficulty
          </div>
          <div className="p-6 rounded-xl border bg-card">
            Upload notes, PDFs, and assignments
          </div>
          <div className="p-6 rounded-xl border bg-card">
            Chat with Dr. Botonic — your AI professor
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold mb-6">
          Built for Ambitious Students
        </h2>
        <p className="text-lg text-muted-foreground">
          Whether you're studying at Harvard, Yale, or grinding through late‑night
          problem sets at home, Botnology101 gives you the clarity and confidence
          to master any subject.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Botnology101 — All Rights Reserved.
      </footer>
    </main>
  );
}
