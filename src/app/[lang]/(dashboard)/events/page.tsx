import { redirect } from "next/navigation";
import { getAccessToken, getSession } from "@/lib/session";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { fetchEvents } from "@/lib/events";
import { fetchFamily } from "@/lib/family";
import EventsClient from "@/components/events/EventsClient";

export default async function EventsPage({
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

  const isChild = user.role === "child";

  const [events, family] = await Promise.all([
    fetchEvents(token).catch(() => []),
    !isChild ? fetchFamily(token).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <EventsClient
        events={events}
        family={family}
        token={token}
        myUserId={user.id}
        isChild={isChild}
        dict={dict.events}
        commonDict={dict.common}
      />
    </div>
  );
}
