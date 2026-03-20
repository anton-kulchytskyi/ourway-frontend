"use client";

import { useActionState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const { lang } = useParams<{ lang: string }>();
  const boundAction = loginAction.bind(null, lang);
  const [state, action, pending] = useActionState(boundAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold">OurWay</h1>

        <form action={action} className="space-y-4">
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {state.error}
            </p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
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
            <label className="text-sm font-medium" htmlFor="password">Password</label>
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
            className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50 dark:bg-amber-500 dark:hover:bg-amber-400"
          >
            {pending ? "..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href={`/${lang}/register`} className="font-medium text-amber-600 underline dark:text-amber-400">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
