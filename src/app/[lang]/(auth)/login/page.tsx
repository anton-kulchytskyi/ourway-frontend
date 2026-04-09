"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import { telegramAuthAction } from "@/actions/auth";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TG_BOT_USERNAME ?? "";

export default function LoginPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).onTelegramAuth = async (
      user: Record<string, unknown>
    ) => {
      setError(null);
      const result = await telegramAuthAction(lang, user);
      if (result?.ok) {
        router.push(`/${lang}/today`);
      } else {
        setError(result?.error ?? "Auth failed");
      }
    };
  }, [lang, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">OurWay</span>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Sign in with Telegram to continue
          </p>

          <Script
            src="https://telegram.org/js/telegram-widget.js?22"
            data-telegram-login={BOT_USERNAME}
            data-size="large"
            data-onauth="onTelegramAuth(user)"
            data-request-access="write"
            strategy="afterInteractive"
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
