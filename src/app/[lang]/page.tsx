import Link from "next/link";
import { getDictionary, hasLocale } from "./dictionaries";
import LangSwitcher from "@/components/ui/LangSwitcher";
import { getSession } from "@/lib/session";

const TG_BOT_URL = process.env.NEXT_PUBLIC_TG_BOT_URL ?? "https://t.me/ourway_tasks_bot";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const user = await getSession();
  const locale = hasLocale(lang) ? lang : "en";
  const dict = await getDictionary(locale);
  const t = dict.landing;

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href={`/${lang}`}
          className="text-xl font-bold text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity"
        >
          OurWay
        </Link>
        <div className="flex items-center gap-4">
          <LangSwitcher lang={lang} />
          {user ? (
            <Link
              href={`/${lang}/today`}
              className="text-sm font-medium text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400"
            >
              {user.name}
            </Link>
          ) : (
            <Link
              href={`/${lang}/login`}
              className="text-sm font-medium text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400"
            >
              {t.signIn}
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        {/* Logo */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-200 dark:shadow-amber-900">
          <span className="text-4xl font-bold text-white">O</span>
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl">
          OurWay
        </h1>
        <p className="mb-3 text-xl font-medium text-stone-700 dark:text-stone-300">
          {t.tagline}
        </p>
        <p className="mb-10 max-w-md text-base text-stone-500 dark:text-stone-400">
          {t.description}
        </p>

        {/* CTAs */}
        {user ? (
          <Link
            href={`/${lang}/today`}
            className="flex items-center justify-center rounded-xl bg-amber-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-400 active:scale-95"
          >
            {lang === "uk" ? "Відкрити додаток" : "Open App"}
          </Link>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <a
              href={TG_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a96d9] active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden>
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z" />
              </svg>
              {t.ctaTelegram}
            </a>
            <Link
              href={`/${lang}/login`}
              className="text-sm text-stone-400 hover:text-amber-600 dark:text-stone-500 dark:hover:text-amber-400 transition-colors"
            >
              {t.signIn}
            </Link>
          </div>
        )}

        {/* Features */}
        <div className="mt-20 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          {t.features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-1 font-semibold text-stone-900 dark:text-stone-50">{f.title}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">{f.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-stone-400 dark:text-stone-600">
        © {new Date().getFullYear()} OurWay
      </footer>
    </div>
  );
}
