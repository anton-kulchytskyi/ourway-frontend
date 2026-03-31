import { redirect } from "next/navigation";
import { getAccessToken, getSession } from "@/lib/session";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { fetchSchedules } from "@/lib/schedule";
import { fetchFamily } from "@/lib/family";
import ScheduleClient from "@/components/schedule/ScheduleClient";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";

  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/login`);

  const user = await getSession();
  if (!user) redirect(`/${lang}/login`);

  const dict = await getDictionary(locale);

  const isOwner = user.role === "owner";

  // Fetch own schedules + children's schedules (owner only)
  const [mySchedules, children] = await Promise.all([
    fetchSchedules(token).catch(() => []),
    isOwner ? fetchFamily(token).catch(() => []) : Promise.resolve([]),
  ]);

  const childList = children.filter((m) => m.role === "child");

  const childSchedules = isOwner
    ? await Promise.all(
        childList.map((child) =>
          fetchSchedules(token, child.id)
            .then((entries) => ({ child, entries }))
            .catch(() => ({ child, entries: [] }))
        )
      )
    : [];

  return (
    <div className="flex flex-col gap-4">
      <ScheduleClient
        mySchedules={mySchedules}
        childSchedules={childSchedules}
        children={childList}
        token={token}
        myUserId={user.id}
        isOwner={isOwner}
        dict={dict.schedule}
        commonDict={dict.common}
      />
    </div>
  );
}
