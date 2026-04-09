import Link from "next/link";

const BOT_URL = process.env.NEXT_PUBLIC_TG_BOT_URL ?? "https://t.me/ourway_bot";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex w-full items-center justify-between">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            {lang === "uk" ? "Назад" : "Back"}
          </Link>
          <Link
            href={`/${lang}`}
            className="text-2xl font-bold text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity"
          >
            OurWay
          </Link>
          <div className="w-14" />
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {lang === "uk"
              ? "Відкрий бот у Telegram щоб увійти або зареєструватись"
              : "Open the bot in Telegram to sign in or create an account"}
          </p>

          <a
            href={BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#2AABEE] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1a96d9]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
            </svg>
            {lang === "uk" ? "Відкрити Telegram бот" : "Open Telegram Bot"}
          </a>
        </div>

        <p className="text-center text-xs text-stone-400 dark:text-stone-500">
          {lang === "uk"
            ? "Бот надішле тобі посилання для входу після реєстрації"
            : "The bot will send you a login link after registration"}
        </p>
      </div>
    </div>
  );
}
