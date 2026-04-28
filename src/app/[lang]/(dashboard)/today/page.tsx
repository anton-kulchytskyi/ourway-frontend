import { redirect } from "next/navigation";
import { getAccessToken, getSession } from "@/lib/session";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { fetchDay, fetchFamilyDay } from "@/lib/today";
import TodayClient from "@/components/today/TodayClient";

export default async function TodayPage({
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

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: user.timezone || "UTC",
  }).format(new Date());

  const [myDay, familyDay] = await Promise.all([
    fetchDay(token, today).catch(() => null),
    user.role === "owner"
      ? fetchFamilyDay(token, today).catch(() => null)
      : Promise.resolve(null),
  ]);

  const needsApproval = user.role === "child" && (!user.autonomy_level || user.autonomy_level < 3);

  return (
    <div className="flex flex-col gap-4">
      <TodayClient
        date={today}
        myDay={myDay}
        familyDay={familyDay}
        token={token}
        myUserId={user.id}
        myName={user.name}
        needsApproval={needsApproval}
        dict={dict.today}
      />
    </div>
  );
}
