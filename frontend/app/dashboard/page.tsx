export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8">Botnology101</h2>

        <nav className="space-y-4">
          <a href="/dashboard" className="block text-lg font-medium text-blue-600">
            Dashboard
          </a>
          <a href="/courses" className="block text-lg text-gray-700 hover:text-blue-600">
            Courses
          </a>
          <a href="/study-hall" className="block text-lg text-gray-700 hover:text-blue-600">
            Study Hall
          </a>
          <a href="/tutor" className="block text-lg text-gray-700 hover:text-blue-600">
            AI Tutor
          </a>
          <a href="/settings" className="block text-lg text-gray-700 hover:text-blue-600">
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">

        {/* Top Bar */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Welcome back, Jason</span>
            <img
              src="/avatar.png"
              alt="User Avatar"
              className="w-10 h-10 rounded-full border"
            />
          </div>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-2">Active Courses</h3>
            <p className="text-4xl font-bold text-blue-600">3</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-2">Study Hours</h3>

