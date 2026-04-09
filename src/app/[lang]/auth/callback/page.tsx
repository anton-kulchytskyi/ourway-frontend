import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setSession } from "@/lib/session";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

export default async function AuthCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { lang } = await params;
  const { token } = await searchParams;

  if (!token) {
    redirect(`/${lang}/login`);
  }

  try {
    const data = await apiFetch<TokenResponse>("/auth/web-login", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    await setSession(data.access_token, data.refresh_token);
  } catch {
    redirect(`/${lang}/login`);
  }

  redirect(`/${lang}/today`);
}
