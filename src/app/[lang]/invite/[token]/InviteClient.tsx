"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InvitationPublicInfo } from "@/lib/invitations";
import { acceptInvitation } from "@/lib/invitations";
import Link from "next/link";

type Props = {
  info: InvitationPublicInfo | null;
  error: string | null;
  inviteToken: string;
  authToken: string | null;
  lang: string;
};

export default function InviteClient({ info, error, inviteToken, authToken, lang }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  async function handleAccept() {
    if (!authToken) return;
    setLoading(true);
    setAcceptError(null);
    try {
      await acceptInvitation(inviteToken, authToken);
      setDone(true);
      setTimeout(() => router.push(`/${lang}/tasks`), 1500);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setAcceptError(e.detail ?? "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{info?.space_emoji ?? "📋"}</div>
          <h1 className="text-xl font-bold">You're invited!</h1>
        </div>

        {error ? (
          <div className="text-center">
            <p className="text-red-500 text-sm mb-6">{error}</p>
            <Link
              href={`/${lang}/tasks`}
              className="text-sm text-amber-500 hover:underline"
            >
              Go to app
            </Link>
          </div>
        ) : done ? (
          <div className="text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-medium">Joined successfully!</p>
            <p className="text-sm text-stone-400 mt-1">Redirecting...</p>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-stone-50 dark:bg-stone-800 p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Space</span>
                <span className="font-medium">{info?.space_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Invited by</span>
                <span className="font-medium">{info?.invited_by_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Your role</span>
                <span className={`font-medium capitalize ${info?.role === "editor" ? "text-amber-600" : "text-stone-500"}`}>
                  {info?.role}
                </span>
              </div>
            </div>

            {acceptError && (
              <p className="mb-4 text-sm text-red-500 text-center">{acceptError}</p>
            )}

            {authToken ? (
              <button
                onClick={handleAccept}
                disabled={loading}
                className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? "Joining..." : "Accept & Join"}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-sm text-stone-500">Sign in to accept this invitation</p>
                <Link
                  href={`/${lang}/login?redirect=/invite/${inviteToken}`}
                  className="block w-full rounded-xl bg-amber-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-amber-400"
                >
                  Sign in
                </Link>
                <Link
                  href={`/${lang}/register?redirect=/invite/${inviteToken}`}
                  className="block w-full rounded-xl border border-stone-200 py-3 text-center text-sm font-medium text-stone-600 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300"
                >
                  Create account
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
