import { getAccessToken, getSession } from "@/lib/session";
import { logoutAction, deleteAccountAction } from "@/actions/auth";
import SettingsClient from "@/components/settings/SettingsClient";
import { redirect } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/login`);

  const user = await getSession();
  if (!user) redirect(`/${lang}/login`);

  const locale = hasLocale(lang) ? lang : "en";
  const dict = await getDictionary(locale);
  const logout = logoutAction.bind(null, lang);
  const deleteAccount = deleteAccountAction.bind(null, lang, token);

  return (
    <SettingsClient
      user={user}
      lang={lang}
      t={dict.settings}
      authToken={token}
      logoutAction={logout}
      deleteAccountAction={deleteAccount}
    />
  );
}
