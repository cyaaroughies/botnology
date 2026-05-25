import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-semibold mb-8">Botnology101</h2>

        <nav className="flex flex-col gap-3">
          <a className="text-muted-foreground hover:text-foreground transition" href="#">
            Dashboard Home
          </a>
          <a className="text-muted-foreground hover:text-foreground transition" href="#">
            Study Desktop
          </a>
          <a className="text-muted-foreground hover:text-foreground transition" href="#">
            Notes
          </a>
          <a className="text-muted-foreground hover:text-foreground transition" href="#">
            File Uploads
          </a>
          <a className="text-muted-foreground hover:text-foreground transition" href="#">
            Practice Quizzes
          </a>
          <a className="text-muted-foreground hover:text-foreground transition" href="#">
            Chat with Dr. Botonic
          </a>
        </nav>

        <div className="mt-auto pt-10">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Client-side logout
              import("next-auth/react").then(({ signOut }) => signOut());
            }}
          >
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Welcome back</h1>

        <p className="text-muted-foreground mb-10">
          Your personalized AI tutoring dashboard is ready.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-xl bg-card">
            <h3 className="text-xl font-semibold mb-2">Study Desktop</h3>
            <p className="text-muted-foreground mb-4">
              Access your workspace, notes, and study tools.
            </p>
            <Button>Open</Button>
          </div>

          <div className="p-6 border rounded-xl bg-card">
            <h3 className="text-xl font-semibold mb-2">Chat with Dr. Botonic</h3>
            <p className="text-muted-foreground mb-4">
              Ask questions, get explanations, and learn faster.
            </p>
            <Button>Start Chat</Button>
          </div>

          <div className="p-6 border rounded-xl bg-card">
            <h3 className="text-xl font-semibold mb-2">Upload Files</h3>
            <p className="text-muted-foreground mb-4">
              Upload notes, PDFs, assignments, and more.
            </p>
            <Button>Upload</Button>
          </div>

<Button asChild>
  <a href="/chat">Start Chat</a>
</Button>

          <div className="p-6 border rounded-xl bg-card">
            <h3 className="text-xl font-semibold mb-2">Practice Quizzes</h3>
            <p className="text-muted-foreground mb-4">
              Generate quizzes and test your knowledge.
            </p>
            <Button>Start Quiz</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

