import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { setSession } from "@/lib/session";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const token = request.nextUrl.searchParams.get("token");
  const loginUrl = new URL(`/${lang}/login`, request.url);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const data = await apiFetch<TokenResponse>("/auth/web-login", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    await setSession(data.access_token, data.refresh_token);
  } catch (err) {
    console.error("[auth/callback] error:", err);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(`/${lang}/today`, request.url));
}
