import { getAccessToken, getSession } from "@/lib/session";
import { fetchTasks, fetchSpaces } from "@/lib/tasks";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { redirect } from "next/navigation";

export default async function TasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ space?: string }>;
}) {
  const { lang } = await params;
  const { space } = await searchParams;
  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/login`);

  const user = await getSession();
  if (!user) redirect(`/${lang}/login`);

  const [tasks, spaces] = await Promise.all([
    fetchTasks(token).catch(() => []),
    fetchSpaces(token).catch(() => []),
  ]);

  const defaultSpaceId = space ? Number(space) : (spaces[0]?.id ?? null);
  const canDeleteTasks = !(user.role === "child" && user.autonomy_level && user.autonomy_level <= 2);

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className="text-xl font-bold">Tasks</h1>
      <KanbanBoard initialTasks={tasks} spaces={spaces} token={token} defaultSpaceId={defaultSpaceId} canDeleteTasks={canDeleteTasks} />
    </div>
  );
}
