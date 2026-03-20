"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setSession, clearSession } from "@/lib/session";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

export async function loginAction(
  locale: string,
  _: unknown,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string | null;

  try {
    const data = await apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await setSession(data.access_token, data.refresh_token);
  } catch (err: unknown) {
    const e = err as { detail?: string };
    return { error: e.detail ?? "Login failed" };
  }

  redirect(redirectTo ? `/${locale}${redirectTo}` : `/${locale}`);
}

export async function registerAction(
  locale: string,
  _: unknown,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const redirectTo = formData.get("redirect") as string | null;

  try {
    const data = await apiFetch<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, locale }),
    });
    await setSession(data.access_token, data.refresh_token);
  } catch (err: unknown) {
    const e = err as { detail?: string };
    return { error: e.detail ?? "Registration failed" };
  }

  redirect(redirectTo ? `/${locale}${redirectTo}` : `/${locale}`);
}

export async function logoutAction(locale: string) {
  await clearSession();
  redirect(`/${locale}/login`);
}
