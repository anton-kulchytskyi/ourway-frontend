import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

const isProduction = process.env.NODE_ENV === "production";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const token = request.nextUrl.searchParams.get("token");
  const loginUrl = new URL(`/${lang}/login`, request.url);

  console.log("[auth/callback] lang:", lang, "token:", token ? token.slice(0, 20) + "..." : "missing");

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  let data: TokenResponse;
  try {
    data = await apiFetch<TokenResponse>("/auth/web-login", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.error("[auth/callback] error:", err);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(`/${lang}/today`, request.url));
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
