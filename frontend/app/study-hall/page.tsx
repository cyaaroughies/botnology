export default function StudyHallPage() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-8">

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Study Hall</h1>
        <p className="text-gray-600 text-lg">
          Your personal workspace for notes, flashcards, and practice.
        </p>
      </header>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Create Notes</h3>
          <p className="text-gray-600 mb-4">Write and organize your study notes.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Open Notes
          </button>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Flashcards</h3>
          <p className="text-gray-600 mb-4">Review concepts with spaced repetition.</p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
            Start Flashcards
          </button>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Practice Quizzes</h3>
          <p className="text-gray-600 mb-4">Test your knowledge with auto‑generated quizzes.</p>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
            Take Quiz
          </button>
        </div>
      </section>

      {/* Notes Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Your Notes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Calculus Notes</h3>
            <p className="text-gray-600 mb-4">
              Limits, derivatives, and chain rule examples.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Open
            </button>
          </div>

          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Chemistry Notes</h3>
            <p className="text-gray-600 mb-4">
              Hydrocarbons, bonding, and reaction mechanisms.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Open
            </button>
          </div>
        </div>
      </section>

      {/* Flashcards Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Flashcards</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Calculus I</h3>
            <p className="text-gray-600 mb-4">45 cards</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Review
            </button>
          </div>

          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Organic Chemistry</h3>
            <p className="text-gray-600 mb-4">28 cards</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Review
            </button>
          </div>

          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Physics II</h3>
            <p className="text-gray-600 mb-4">33 cards</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Review
            </button>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>

        <div className="bg-white p-6 rounded-xl shadow">
          <ul className="space-y-4">
            <li className="flex justify-between">
              <span className="text-gray-700">Reviewed 12 flashcards (Calculus)</span>
              <span className="text-gray-500 text-sm">2 hours ago</span>
            </li>

            <li className="flex justify-between">
              <span className="text-gray-700">Added new notes (Chemistry)</span>
              <span className="text-gray-500 text-sm">Yesterday</span>
            </li>

            <li className="flex justify-between">
              <span className="text-gray-700">Completed quiz (Physics II)</span>
              <span className="text-gray-500 text-sm">2 days ago</span>
            </li>
          </ul>
        </div>
      </section>

    </main>
  );
}
