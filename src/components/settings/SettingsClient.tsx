"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/session";
import ConfirmModal from "@/components/ui/ConfirmModal";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  member: "Member",
  child: "Child",
};

const AUTONOMY_LABELS: Record<number, string> = {
  1: "Supervised",
  2: "Semi-autonomous",
  3: "Autonomous",
};

type Props = {
  user: SessionUser;
  lang: string;
  logoutAction: () => Promise<void>;
  deleteAccountAction: () => Promise<void>;
};

export default function SettingsClient({ user, lang, logoutAction, deleteAccountAction }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function switchLang(newLang: string) {
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${newLang}`);
    router.push(newPath);
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Profile */}
      <section className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Profile</p>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-700">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-stone-500">Name</span>
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-stone-500">Email</span>
            <span className="text-sm font-medium truncate max-w-[200px]">{user.email}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-stone-500">Role</span>
            <span className="text-sm font-medium">{ROLE_LABELS[user.role] ?? user.role}</span>
          </div>
          {user.role === "child" && user.autonomy_level && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-stone-500">Autonomy</span>
              <span className="text-sm font-medium">{AUTONOMY_LABELS[user.autonomy_level]}</span>
            </div>
          )}
        </div>
      </section>

      {/* Language */}
      <section className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Language</p>
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

      {/* Account actions */}
      <section className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Account</p>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-700">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full px-4 py-3 text-left text-sm text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors"
            >
              Logout
            </button>
          </form>
          {user.role === "owner" && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              Delete account & all data
            </button>
          )}
        </div>
      </section>

      {confirmDelete && (
        <ConfirmModal
          title="Delete account?"
          message={
            user.role === "owner"
              ? "This will permanently delete your account, all spaces, tasks, and family members."
              : "This will permanently delete your account."
          }
          confirmLabel="Delete"
          danger
          onConfirm={deleteAccountAction}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
