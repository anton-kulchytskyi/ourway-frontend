import { getAccessToken } from "@/lib/session";
import { fetchTasks, fetchSpaces } from "@/lib/tasks";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { redirect } from "next/navigation";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/login`);

  const [tasks, spaces] = await Promise.all([
    fetchTasks(token).catch(() => []),
    fetchSpaces(token).catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className="text-xl font-bold">Tasks</h1>
      <KanbanBoard initialTasks={tasks} spaces={spaces} token={token} />
    </div>
  );
}
