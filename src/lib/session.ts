import "server-only";
import { cookies } from "next/headers";
import { apiFetch } from "./api";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: "owner" | "member" | "child";
  locale: string;
  autonomy_level?: number | null;
};

export async function setSession(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
  jar.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
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
