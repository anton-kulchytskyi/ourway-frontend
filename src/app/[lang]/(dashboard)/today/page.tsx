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

  // TODO: use user's timezone when timezone field is added to profile
  const today = new Date().toISOString().split("T")[0];

  const [myDay, familyDay] = await Promise.all([
    fetchDay(token, today).catch(() => null),
    user.role === "owner"
      ? fetchFamilyDay(token, today).catch(() => null)
      : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <TodayClient
        date={today}
        myDay={myDay}
        familyDay={familyDay}
        token={token}
        myUserId={user.id}
        myName={user.name}
        dict={dict.today}
      />
    </div>
  );
}
