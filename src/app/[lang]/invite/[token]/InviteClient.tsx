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
  botUrl: string;
};

export default function InviteClient({ info, error, inviteToken, authToken, lang, botUrl }: Props) {
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
              <div className="space-y-4">
                <p className="text-center text-sm text-stone-500">
                  Open the link in Telegram to join:
                </p>
                <a
                  href={`${botUrl}?start=inv_${inviteToken}`}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#2AABEE] py-3 text-sm font-semibold text-white transition hover:bg-[#1a96d9]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
                  </svg>
                  Join via Telegram
                </a>
                <p className="text-center text-xs text-stone-400">
                  Already have an account?{" "}
                  <Link href={`/${lang}/login`} className="text-amber-500 hover:underline">
                    Sign in
                  </Link>
                  {" "}first, then open this link again.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
