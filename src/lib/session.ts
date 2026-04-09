import "server-only";
import { cookies } from "next/headers";
import { apiFetch } from "./api";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const isProduction = process.env.NODE_ENV === "production";

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 1 day
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export type SessionUser = {
  id: number;
  email: string | null;
  name: string;
  role: "owner" | "member" | "child";
  locale: string;
  autonomy_level?: number | null;
};

export async function setSession(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, accessToken, ACCESS_COOKIE_OPTIONS);
  jar.set(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value;
}

export async function getSession(): Promise<SessionUser | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await apiFetch<SessionUser>("/auth/me", { token });
  } catch {
    return null;
  }
}
