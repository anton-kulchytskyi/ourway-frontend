import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { ACCESS_COOKIE, ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS } from "@/lib/session";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const baseUrl = request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(new URL("/en/login", baseUrl));
  }

  let data: TokenResponse;
  try {
    data = await apiFetch<TokenResponse>("/auth/web-login", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  } catch {
    return NextResponse.redirect(new URL("/en/login", baseUrl));
  }

  const response = NextResponse.redirect(new URL("/en/today", baseUrl));
  response.cookies.set(ACCESS_COOKIE, data.access_token, ACCESS_COOKIE_OPTIONS);
  response.cookies.set(REFRESH_COOKIE, data.refresh_token, REFRESH_COOKIE_OPTIONS);
  return response;
}
