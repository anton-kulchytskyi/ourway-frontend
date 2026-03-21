"use client";

import { useActionState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { useDict } from "@/lib/useDict";

function LoginForm() {
  const { lang } = useParams<{ lang: string }>();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "";
  const boundAction = loginAction.bind(null, lang);
  const [state, action, pending] = useActionState(boundAction, undefined);
  const t = useDict(lang).auth;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center gap-1 text-sm text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" /></svg>
            Home
          </Link>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">OurWay</span>
          <div className="w-14" />
        </div>

        <form action={action} className="space-y-4">
          {redirect && <input type="hidden" name="redirect" value={redirect} />}

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {state.error}
            </p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">{t.email}</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 dark:border-stone-700 dark:bg-stone-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">{t.password}</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 dark:border-stone-700 dark:bg-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50"
          >
            {pending ? "..." : t.loginButton}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {t.noAccount}{" "}
          <Link
            href={`/${lang}/register${redirect ? `?redirect=${redirect}` : ""}`}
            className="font-medium text-amber-600 underline dark:text-amber-400"
          >
            {t.registerLink}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
