"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LANGS = ["en", "uk"] as const;

export default function LangSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-stone-300 dark:text-stone-600">/</span>}
          {l === lang ? (
            <span className="text-amber-600 dark:text-amber-400">{l.toUpperCase()}</span>
          ) : (
            <Link
              href={pathname.replace(`/${lang}`, `/${l}`)}
              className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            >
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
