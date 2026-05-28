import Link from "next/link";

const navLink =
  "rounded-full border border-[rgba(214,182,107,.16)] bg-white/5 px-4 py-2 text-sm font-semibold text-[#e8f3ee] transition hover:bg-white/10 hover:text-white";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[radial-gradient(1000px_700px_at_20%_10%,rgba(191,230,208,.12),transparent_55%),radial-gradient(900px_600px_at_80%_0%,rgba(214,182,107,.12),transparent_60%),linear-gradient(180deg,#07140e_0%,#0b1a12_45%,#07140e_100%)] text-[#f8f3e7]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-6 px-4 py-6 lg:px-6">
        <header className="flex flex-col gap-4 rounded-[22px] border border-[rgba(214,182,107,.18)] bg-[rgba(8,20,14,.82)] p-4 shadow-[0_20px_60px_rgba(0,0,0,.28)] backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <img src="/dr-botonic.jpeg" alt="Dr. Botnotic" className="h-12 w-12 rounded-full border border-[rgba(214,182,107,.32)] object-cover" />
            <div className="leading-none">
              <div className="text-[14px] font-bold tracking-[0.04em]">Botnology101</div>
              <div className="mt-1 text-xs text-[#b8c6c0]">Dr. Botnotic • Student Dashboard</div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2 lg:justify-end">
            <Link href="/" className={navLink}>Home</Link>
            <Link href="/courses" className={navLink}>Courses</Link>
            <Link href="/study-hall" className={navLink}>Study Hall</Link>
            <Link href="/tutor" className={navLink}>AI Tutor</Link>
            <Link href="/login" className="rounded-full border border-[rgba(214,182,107,.35)] bg-[linear-gradient(135deg,#d6b667,#b99644)] px-4 py-2 text-sm font-semibold text-[#08120d] transition hover:brightness-105">Sign In</Link>
          </nav>
        </header>

        <section className="grid gap-6 rounded-[24px] border border-[rgba(214,182,107,.18)] bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,.24)] lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.9fr)] lg:p-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#d6b667]">Premium student portal</div>
            <h1 className="mt-3 max-w-[12ch] text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">Welcome back, Jason.</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#d7e3dd]">
              Your Botnology101 dashboard keeps the same calm, collegiate visual language as the rest of the site while surfacing progress, study time, and course momentum.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/courses" className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#d6b667,#b99644)] px-4 py-3 text-sm font-bold text-[#08120d] transition hover:brightness-105">Open Courses</Link>
              <Link href="/study-hall" className="inline-flex items-center justify-center rounded-full border border-[rgba(214,182,107,.18)] bg-white/5 px-4 py-3 text-sm font-bold text-[#f8f3e7] transition hover:bg-white/10">Go to Study Hall</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[rgba(214,182,107,.16)] bg-[rgba(5,13,9,.65)] p-4 text-center">
              <div className="text-3xl font-black text-[#f3d78a]">3</div>
              <div className="mt-1 text-xs text-[#d7e3dd]">Active Courses</div>
            </div>
            <div className="rounded-2xl border border-[rgba(214,182,107,.16)] bg-[rgba(5,13,9,.65)] p-4 text-center">
              <div className="text-3xl font-black text-[#f3d78a]">12</div>
              <div className="mt-1 text-xs text-[#d7e3dd]">Study Hours</div>
            </div>
            <div className="rounded-2xl border border-[rgba(214,182,107,.16)] bg-[rgba(5,13,9,.65)] p-4 text-center">
              <div className="text-3xl font-black text-[#f3d78a]">24</div>
              <div className="mt-1 text-xs text-[#d7e3dd]">Completed Lessons</div>
            </div>
            <div className="rounded-2xl border border-[rgba(214,182,107,.16)] bg-[rgba(5,13,9,.65)] p-4 text-center">
              <div className="text-3xl font-black text-[#f3d78a]">98%</div>
              <div className="mt-1 text-xs text-[#d7e3dd]">Tutor Satisfaction</div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Today\'s Focus", value: "Linear Algebra review and one quiz", accent: "#d6b667" },
            { title: "Upcoming Deadlines", value: "3 assignments due this week", accent: "#8d4b3b" },
            { title: "Momentum", value: "You\'re ahead in 2 of 3 active courses", accent: "#3f7d5c" },
          ].map((card) => (
            <article key={card.title} className="rounded-[18px] border border-[rgba(214,182,107,.15)] bg-[rgba(8,20,14,.76)] p-5 shadow-[0_14px_34px_rgba(0,0,0,.16)]">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#b8c6c0]">{card.title}</div>
              <p className="mt-3 text-base leading-7 text-[#f8f3e7]">{card.value}</p>
              <div className="mt-4 h-1.5 w-20 rounded-full" style={{ background: card.accent }} />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

