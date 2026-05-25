export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-8">

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Your Courses</h1>
        <p className="text-gray-600 text-lg">
          Continue learning or explore new subjects.
        </p>
      </header>

      {/* Categories */}
      <section className="mb-10">
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">All</button>
          <button className="px-6 py-2 bg-white shadow rounded-lg">Math</button>
          <button className="px-6 py-2 bg-white shadow rounded-lg">Science</button>
          <button className="px-6 py-2 bg-white shadow rounded-lg">Chemistry</button>
          <button className="px-6 py-2 bg-white shadow rounded-lg">Physics</button>
          <button className="px-6 py-2 bg-white shadow rounded-lg">Biology</button>
        </div>
      </section>

      {/* Course Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Course Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Calculus I</h3>
          <p className="text-gray-600 mb-4">Master limits, derivatives, and integrals.</p>

          <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
          </div>

          <a href="/courses/calculus">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Continue
            </button>
          </a>
        </div>

        {/* Course Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Organic Chemistry</h3>
          <p className="text-gray-600 mb-4">Understand molecular structure and reactions.</p>

          <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: "20%" }}></div>
          </div>

          <a href="/courses/chemistry">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Continue
            </button>
          </a>
        </div>

        {/* Course Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Physics II</h3>
          <p className="text-gray-600 mb-4">Electricity, magnetism, and circuits.</p>

          <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: "70%" }}></div>
          </div>

          <a href="/courses/physics">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              Continue
            </button>
          </a>
        </div>

      </section>
    </main>
  );
}
