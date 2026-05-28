export default function StudyHallPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(1000px_700px_at_20%_10%,rgba(191,230,208,.12),transparent_55%),radial-gradient(900px_600px_at_80%_0%,rgba(214,182,107,.12),transparent_60%),linear-gradient(180deg,#07140e_0%,#0b1a12_45%,#07140e_100%)] text-[#f8f3e7]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-6">
        <header className="flex flex-col gap-4 rounded-[22px] border border-[rgba(214,182,107,.18)] bg-[rgba(8,20,14,.82)] p-4 shadow-[0_20px_60px_rgba(0,0,0,.28)] backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <img src="/dr-botonic.jpeg" alt="Dr. Botnotic" className="h-12 w-12 rounded-full border border-[rgba(214,182,107,.32)] object-cover" />
            <div className="leading-none">
              <div className="text-[14px] font-bold tracking-[0.04em]">Botnology101</div>
              <div className="mt-1 text-xs text-[#b8c6c0]">Dr. Botnotic • Study Hall</div>
            </div>
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#d6b667]">Focused study workspace</div>
        </header>

        <section className="mt-6 rounded-[24px] border border-[rgba(214,182,107,.18)] bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,.24)] lg:p-8">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#d6b667]">Study Hall</div>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">A calm space for notes, flashcards, and practice.</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#d7e3dd]">
            The layout now matches the rest of the Botnology101 experience: gold accents, forest tones, and cards that feel deliberate instead of generic.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: "Create Notes", body: "Write and organize your study notes.", action: "Open Notes", tone: "#d6b667" },
            { title: "Flashcards", body: "Review concepts with spaced repetition.", action: "Start Flashcards", tone: "#3f7d5c" },
            { title: "Practice Quizzes", body: "Test your knowledge with auto-generated quizzes.", action: "Take Quiz", tone: "#8d4b3b" },
          ].map((item) => (
            <article key={item.title} className="rounded-[18px] border border-[rgba(214,182,107,.15)] bg-[rgba(8,20,14,.76)] p-5 shadow-[0_14px_34px_rgba(0,0,0,.16)]">
              <h3 className="text-xl font-semibold text-[#f8f3e7]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#b8c6c0]">{item.body}</p>
              <button className="mt-5 rounded-full px-4 py-2 text-sm font-bold text-[#08120d] transition hover:brightness-105" style={{ background: item.tone }}>
                {item.action}
              </button>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[18px] border border-[rgba(214,182,107,.15)] bg-[rgba(8,20,14,.76)] p-5 shadow-[0_14px_34px_rgba(0,0,0,.16)]">
            <h2 className="text-2xl font-semibold text-[#f8f3e7]">Your Notes</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { title: "Calculus Notes", body: "Limits, derivatives, and chain rule examples." },
                { title: "Chemistry Notes", body: "Hydrocarbons, bonding, and reaction mechanisms." },
              ].map((note) => (
                <div key={note.title} className="rounded-2xl border border-[rgba(214,182,107,.12)] bg-white/4 p-4">
                  <h3 className="text-lg font-semibold text-[#f8f3e7]">{note.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#b8c6c0]">{note.body}</p>
                  <button className="mt-4 rounded-full bg-[linear-gradient(135deg,#d6b667,#b99644)] px-4 py-2 text-sm font-bold text-[#08120d] transition hover:brightness-105">Open</button>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[18px] border border-[rgba(214,182,107,.15)] bg-[rgba(8,20,14,.76)] p-5 shadow-[0_14px_34px_rgba(0,0,0,.16)]">
            <h2 className="text-2xl font-semibold text-[#f8f3e7]">Recent Activity</h2>
            <ul className="mt-4 space-y-4 text-sm text-[#d7e3dd]">
              <li className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
                <span>Reviewed 12 flashcards (Calculus)</span>
                <span className="text-[#8f9f98]">2 hours ago</span>
              </li>
              <li className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
                <span>Added new notes (Chemistry)</span>
                <span className="text-[#8f9f98]">Yesterday</span>
              </li>
              <li className="flex items-start justify-between gap-4">
                <span>Completed quiz (Physics II)</span>
                <span className="text-[#8f9f98]">2 days ago</span>
              </li>
            </ul>
          </article>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: "Calculus I", body: "45 cards", action: "Review", tone: "#3f7d5c" },
            { title: "Organic Chemistry", body: "28 cards", action: "Review", tone: "#d6b667" },
            { title: "Physics II", body: "33 cards", action: "Review", tone: "#8d4b3b" },
          ].map((item) => (
            <article key={item.title} className="rounded-[18px] border border-[rgba(214,182,107,.15)] bg-[rgba(8,20,14,.76)] p-5 shadow-[0_14px_34px_rgba(0,0,0,.16)]">
              <h3 className="text-lg font-semibold text-[#f8f3e7]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#b8c6c0]">{item.body}</p>
              <button className="mt-4 rounded-full px-4 py-2 text-sm font-bold text-[#08120d] transition hover:brightness-105" style={{ background: item.tone }}>
                {item.action}
              </button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
