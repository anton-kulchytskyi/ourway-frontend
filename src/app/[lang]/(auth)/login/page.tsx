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
        <h1 className="mb-8 text-center text-2xl font-bold">OurWay</h1>

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
