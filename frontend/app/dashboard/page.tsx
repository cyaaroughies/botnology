import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    // your dashboard JSX here
  );
}
