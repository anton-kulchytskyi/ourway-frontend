import { getAccessToken, getSession } from "@/lib/session";
import { fetchTasks } from "@/lib/tasks";
import { fetchSpaces } from "@/lib/spaces";
import { fetchFamily } from "@/lib/family";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { redirect } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";

export default async function TasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ space?: string }>;
}) {
  const { lang } = await params;
  const { space } = await searchParams;
  const locale = hasLocale(lang) ? lang : "en";
  const dict = await getDictionary(locale);
  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/login`);

  const user = await getSession();
  if (!user) redirect(`/${lang}/login`);

  const [tasks, spaces, family] = await Promise.all([
    fetchTasks(token).catch(() => []),
    fetchSpaces(token).catch(() => []),
    fetchFamily(token).catch(() => []),
  ]);

  const defaultSpaceId = space ? Number(space) : (spaces[0]?.id ?? null);
  const canDeleteTasks = !(user.role === "child" && user.autonomy_level && user.autonomy_level <= 2);
  const needsApproval = user.role === "child" && (!user.autonomy_level || user.autonomy_level < 3);

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className="text-xl font-bold">{dict.tasks.title}</h1>
      <KanbanBoard
        initialTasks={tasks}
        spaces={spaces}
        token={token}
        defaultSpaceId={defaultSpaceId}
        canDeleteTasks={canDeleteTasks}
        needsApproval={needsApproval}
        familyMembers={family}
        currentUserId={user.id}
      />
    </div>
  );
}
