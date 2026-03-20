import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getSession();

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
      <p className="mt-2 text-zinc-500">Your family space is ready.</p>
    </div>
  );
}
