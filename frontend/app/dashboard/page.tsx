export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Your Courses</h2>
          <p className="text-gray-600">View and continue your active courses.</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Study Hall</h2>
          <p className="text-gray-600">Access your study tools and notes.</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">AI Tutor</h2>
          <p className="text-gray-600">Chat with Dr. Botonic for help.</p>
        </div>
      </section>
    </main>
  );
}

