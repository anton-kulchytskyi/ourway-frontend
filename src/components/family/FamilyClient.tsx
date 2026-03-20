"use client";

import { useState } from "react";
import type { FamilyMember } from "@/lib/family";
import { createChild, updateChildAutonomy } from "@/lib/family";

const AUTONOMY_LABELS: Record<number, string> = {
  1: "Supervised",
  2: "Semi-autonomous",
  3: "Autonomous",
};

const AUTONOMY_DESCRIPTIONS: Record<number, string> = {
  1: "Parent sees all spaces",
  2: "Parent can join spaces manually",
  3: "Full privacy",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  member: "Member",
  child: "Child",
};

type Props = {
  initialMembers: FamilyMember[];
  token: string;
  isOwner: boolean;
  currentUserId: number;
};

export default function FamilyClient({ initialMembers, token, isOwner, currentUserId }: Props) {
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autonomyLevel, setAutonomyLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const child = await createChild(token, { name, email, password, autonomy_level: autonomyLevel });
      setMembers((prev) => [...prev, child]);
      setName("");
      setEmail("");
      setPassword("");
      setAutonomyLevel(1);
      setShowCreate(false);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setError(e.detail ?? "Failed to create child account");
    } finally {
      setLoading(false);
    }
  }

  async function handleAutonomyChange(childId: number, level: number) {
    setUpdatingId(childId);
    try {
      const updated = await updateChildAutonomy(token, childId, level);
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } finally {
      setUpdatingId(null);
    }
  }

  const children = members.filter((m) => m.role === "child");
  const adults = members.filter((m) => m.role !== "child");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Family</h1>
        {isOwner && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Child
          </button>
        )}
      </div>

      {/* Adults */}
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Members</h2>
        <div className="flex flex-col gap-2">
          {adults.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                {m.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{m.name}</span>
                  {m.id === currentUserId && (
                    <span className="text-xs text-stone-400">(you)</span>
                  )}
                </div>
                <span className="text-xs text-stone-400">{m.email}</span>
              </div>
              <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500 dark:bg-stone-700 dark:text-stone-400">
                {ROLE_LABELS[m.role]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Children */}
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Children</h2>
        {children.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-400 dark:border-stone-700">
            No child accounts yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {children.map((child) => (
              <div
                key={child.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                    {child.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">{child.name}</span>
                    <span className="text-xs text-stone-400">{child.email}</span>
                  </div>
                </div>

                {isOwner && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-stone-500">Autonomy level</p>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          disabled={updatingId === child.id}
                          onClick={() => handleAutonomyChange(child.id, level)}
                          className={`flex-1 rounded-xl py-2 text-xs font-medium transition-colors ${
                            child.autonomy_level === level
                              ? "bg-amber-500 text-white"
                              : "bg-stone-100 text-stone-500 hover:bg-amber-100 dark:bg-stone-700 dark:text-stone-400"
                          } ${updatingId === child.id ? "opacity-50" : ""}`}
                          title={AUTONOMY_DESCRIPTIONS[level]}
                        >
                          {AUTONOMY_LABELS[level]}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-stone-400">
                      {AUTONOMY_DESCRIPTIONS[child.autonomy_level ?? 1]}
                    </p>
                  </div>
                )}

                {!isOwner && child.autonomy_level && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500 dark:bg-stone-700">
                    {AUTONOMY_LABELS[child.autonomy_level]}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create child modal */}
      {showCreate && (
        <>
          <div
            className="modal-backdrop fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="modal-content w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 shadow-xl pointer-events-auto">
              <div className="px-5 pb-6 pt-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">Add Child Account</h2>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                    {error}
                  </p>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Child's name"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="child@example.com"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Set a password"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-stone-500">Autonomy level</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setAutonomyLevel(level)}
                          className={`flex-1 rounded-xl py-2.5 text-xs font-medium transition-colors ${
                            autonomyLevel === level
                              ? "bg-amber-500 text-white"
                              : "bg-stone-100 text-stone-500 hover:bg-amber-100 dark:bg-stone-700 dark:text-stone-400"
                          }`}
                        >
                          {AUTONOMY_LABELS[level]}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-stone-400">{AUTONOMY_DESCRIPTIONS[autonomyLevel]}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
