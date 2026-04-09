"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setSession, clearSession } from "@/lib/session";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};


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
