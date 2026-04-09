"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setSession, clearSession } from "@/lib/session";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

export async function telegramAuthAction(
  locale: string,
  tgData: Record<string, unknown>
) {
  try {
    const data = await apiFetch<TokenResponse>("/auth/telegram-oauth", {
      method: "POST",
      body: JSON.stringify(tgData),
    });
    await setSession(data.access_token, data.refresh_token);
    return { ok: true };
  } catch (err: unknown) {
    const e = err as { detail?: string };
    return { error: e.detail ?? "Auth failed" };
  }
}

export async function logoutAction(locale: string) {
  await clearSession();
  redirect(`/${locale}/login`);
}

export async function deleteAccountAction(locale: string, token: string) {
  try {
    await apiFetch("/auth/me", { method: "DELETE", token });
  } catch {}
  await clearSession();
  redirect(`/${locale}/login`);
}
