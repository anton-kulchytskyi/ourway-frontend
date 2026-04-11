"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";

const TIMEZONES = [
  { group: "UTC", options: ["UTC"] },
  {
    group: "Europe (UTC+0/+1)",
    options: ["Europe/London", "Europe/Dublin", "Europe/Lisbon"],
  },
  {
    group: "Europe (UTC+1/+2)",
    options: [
      "Europe/Warsaw", "Europe/Berlin", "Europe/Paris", "Europe/Rome",
      "Europe/Madrid", "Europe/Amsterdam", "Europe/Brussels", "Europe/Vienna",
      "Europe/Prague", "Europe/Stockholm", "Europe/Oslo", "Europe/Copenhagen",
    ],
  },
  {
    group: "Europe (UTC+2/+3)",
    options: [
      "Europe/Kyiv", "Europe/Bucharest", "Europe/Helsinki", "Europe/Athens",
      "Europe/Riga", "Europe/Tallinn", "Europe/Vilnius",
    ],
  },
  { group: "Europe (UTC+3)", options: ["Europe/Minsk", "Europe/Moscow"] },
  {
    group: "Americas",
    options: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles"],
  },
  {
    group: "Asia / Pacific",
    options: ["Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney"],
  },
];

type SettingsDict = {
  title: string; profile: string; name: string; email: string; role: string;
  autonomy: string; language: string; timezone: string; timezoneHint: string;
  timezoneSaved: string; account: string; logout: string;
  deleteAccount: string; deleteConfirmTitle: string; deleteConfirmOwner: string;
  deleteConfirmMember: string;
  roles: Record<string, string>;
  autonomyLevels: Record<string, string>;
};

type Props = {
  user: SessionUser;
  lang: string;
  t: SettingsDict;
  authToken: string;
  logoutAction: () => Promise<void>;
  deleteAccountAction: () => Promise<void>;
};

export default function SettingsClient({ user, lang, t, authToken, logoutAction, deleteAccountAction }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [timezone, setTimezone] = useState(user.timezone ?? "UTC");
  const [tzStatus, setTzStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const router = useRouter();
  const pathname = usePathname();

  function switchLang(newLang: string) {
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${newLang}`);
    router.push(newPath);
  }

  async function handleTimezoneChange(tz: string) {
    setTimezone(tz);
    setTzStatus("saving");
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        token: authToken,
        body: JSON.stringify({ timezone: tz }),
      });
      localStorage.setItem("ow_tz", tz);
      setTzStatus("saved");
      setTimeout(() => setTzStatus("idle"), 2000);
    } catch {
      setTzStatus("error");
      setTimeout(() => setTzStatus("idle"), 3000);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <h1 className="text-xl font-bold">{t.title}</h1>

      {/* Profile */}
      <section className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{t.profile}</p>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-700">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-stone-500">{t.name}</span>
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-stone-500">{t.email}</span>
            <span className="text-sm font-medium truncate max-w-[200px]">{user.email}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-stone-500">{t.role}</span>
            <span className="text-sm font-medium">{t.roles[user.role] ?? user.role}</span>
          </div>
          {user.role === "child" && user.autonomy_level && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-stone-500">{t.autonomy}</span>
              <span className="text-sm font-medium">{t.autonomyLevels[String(user.autonomy_level)]}</span>
            </div>
          )}
        </div>
      </section>

      {/* Language */}
      <section className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{t.language}</p>
        </div>
        <div className="flex gap-2 p-4">
          {(["en", "uk"] as const).map((l) => (
            <button
              key={l}
              onClick={() => switchLang(l)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                lang === l
                  ? "bg-amber-500 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-amber-100 dark:bg-stone-700 dark:text-stone-300"
              }`}
            >
              {l === "en" ? "🇬🇧 English" : "🇺🇦 Українська"}
            </button>
          ))}
        </div>
      </section>

      {/* Timezone */}
      <section className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{t.timezone}</p>
        </div>
        <div className="p-4 space-y-2">
          <select
            value={timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            disabled={tzStatus === "saving"}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 disabled:opacity-50"
          >
            {TIMEZONES.map(({ group, options }) => (
              <optgroup key={group} label={group}>
                {options.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className={`text-xs transition-colors ${
            tzStatus === "saved" ? "text-green-500" :
            tzStatus === "error" ? "text-red-500" :
            "text-stone-400"
          }`}>
            {tzStatus === "saved" ? `✓ ${t.timezoneSaved}` :
             tzStatus === "error" ? "✗ Error saving" :
             t.timezoneHint}
          </p>
        </div>
      </section>

      {/* Account */}
      <section className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{t.account}</p>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-700">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full px-4 py-3 text-left text-sm text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors"
            >
              {t.logout}
            </button>
          </form>
          {user.role !== "child" && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              {t.deleteAccount}
            </button>
          )}
        </div>
      </section>

      {confirmDelete && (
        <ConfirmModal
          title={t.deleteConfirmTitle}
          message={user.role === "owner" ? t.deleteConfirmOwner : t.deleteConfirmMember}
          confirmLabel={t.deleteAccount}
          danger
          onConfirm={deleteAccountAction}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
