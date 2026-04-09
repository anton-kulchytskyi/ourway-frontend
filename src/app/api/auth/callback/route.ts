import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

const isProduction = process.env.NODE_ENV === "production";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const baseUrl = request.nextUrl.origin;

  console.log("[api/auth/callback] token:", token ? token.slice(0, 20) + "..." : "missing");

  if (!token) {
    return NextResponse.redirect(new URL("/en/login", baseUrl));
  }

  let data: TokenResponse;
  try {
    data = await apiFetch<TokenResponse>("/auth/web-login", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.error("[api/auth/callback] error:", err);
    return NextResponse.redirect(new URL("/en/login", baseUrl));
  }

  const response = NextResponse.redirect(new URL("/en/today", baseUrl));
  response.cookies.set("access_token", data.access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  response.cookies.set("refresh_token", data.refresh_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
