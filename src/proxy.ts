import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/app/[lang]/dictionaries";

const AUTH_ROUTES = ["/login", "/register"];
const PUBLIC_ROUTES = ["/login", "/register", "/invite"];

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage.split(",")[0].split("-")[0].toLowerCase();
  return locales.includes(preferred as (typeof locales)[number])
    ? preferred
    : defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add locale prefix if missing
  const hasLocalePrefix = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!hasLocalePrefix) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Extract path after locale prefix
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
  const locale = pathname.split("/")[1];
  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => pathWithoutLocale === r || pathWithoutLocale.startsWith(`${r}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathWithoutLocale === r || pathWithoutLocale.startsWith(`${r}/`)
  );

  const token = request.cookies.get("access_token")?.value;

  // Redirect logged-in users away from auth pages
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Redirect unauthenticated users to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|icons|manifest.json).*)"],
};
