"use client";

import { useState } from "react";
import type { Space } from "@/lib/spaces";
import { createSpace, deleteSpace } from "@/lib/spaces";
import { createInvitation, type InvitationRole } from "@/lib/invitations";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Link from "next/link";

const EMOJIS = ["🏠", "👨‍👩‍👧", "💼", "📚", "🛒", "🌿", "🎯", "⭐", "🚗", "💪"];
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "");

type Props = { initialSpaces: Space[]; token: string; lang: string };

export default function SpacesClient({ initialSpaces, token, lang }: Props) {
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Space | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [inviteSpace, setInviteSpace] = useState<Space | null>(null);
  const [inviteRole, setInviteRole] = useState<InvitationRole>("editor");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏠");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateInvite() {
    if (!inviteSpace) return;
    setInviteLoading(true);
    setInviteError(null);
    setInviteLink(null);
    try {
      const inv = await createInvitation(token, inviteSpace.id, inviteRole);
      setInviteLink(`${APP_URL}/${lang}/invite/${inv.token}`);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setInviteError(e.detail ?? "Failed to create invitation");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleCopy() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeInvite() {
    setInviteSpace(null);
    setInviteLink(null);
    setInviteError(null);
    setCopied(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const space = await createSpace(token, name, emoji);
      setSpaces((prev) => [...prev, space]);
      setName("");
      setEmoji("🏠");
      setShowCreate(false);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setError(e.detail ?? "Failed to create space");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleteError(null);
    try {
      await deleteSpace(token, confirmDelete.id);
      setSpaces((prev) => prev.filter((s) => s.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch {
      setDeleteError("Failed to delete space");
      setConfirmDelete(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Spaces</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Space
        </button>
      </div>

      {/* Spaces list */}
      {spaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-400 dark:border-stone-700">
          No spaces yet. Create your first space!
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {spaces.map((space) => (
            <div
              key={space.id}
              className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
            >
              <Link
                href={`/${lang}/tasks`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <span className="text-2xl">{space.emoji ?? "📋"}</span>
                <span className="font-medium truncate">{space.name}</span>
              </Link>
              {space.my_role === "owner" && (
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => { setInviteSpace(space); setInviteLink(null); }}
                    className="rounded-lg p-2 text-stone-400 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-950 transition-colors"
                    title="Invite to space"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(space)}
                    className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FAB mobile */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 shadow-lg text-white hover:bg-amber-400 transition-colors md:hidden"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Create sheet */}
      {showCreate && (
        <>
          <div className="modal-backdrop fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="modal-content w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 shadow-xl max-h-[90dvh] flex flex-col pointer-events-auto">
            <div className="overflow-y-auto px-5 pb-6 pt-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">New Space</h2>
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
                    placeholder="Family, Work, Home..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-stone-500">Emoji</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={`h-10 w-10 rounded-xl text-xl transition-colors ${
                          emoji === e
                            ? "bg-amber-500 ring-2 ring-amber-300"
                            : "bg-stone-100 hover:bg-amber-100 dark:bg-stone-800"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Space"}
                </button>
              </form>
            </div>
          </div>
          </div>
        </>
      )}

      {/* Delete error */}
      {deleteError && (
        <div className="fixed bottom-24 left-4 right-4 z-50 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 shadow-lg dark:bg-red-950 dark:text-red-400">
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-2 font-medium underline">Dismiss</button>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <ConfirmModal
          title="Delete space?"
          message={`"${confirmDelete.name}" and all its tasks will be permanently deleted.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Invite modal */}
      {inviteSpace && (
        <>
          <div className="modal-backdrop fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeInvite} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="modal-content w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 shadow-xl pointer-events-auto">
              <div className="px-5 pb-6 pt-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">
                    Invite to {inviteSpace.emoji} {inviteSpace.name}
                  </h2>
                  <button onClick={closeInvite} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {inviteError && (
                  <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{inviteError}</p>
                )}

                {!inviteLink ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-stone-500">Role</label>
                      <div className="flex gap-2">
                        {(["editor", "viewer"] as InvitationRole[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => setInviteRole(r)}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors capitalize ${
                              inviteRole === r
                                ? "bg-amber-500 text-white"
                                : "bg-stone-100 text-stone-600 hover:bg-amber-100 dark:bg-stone-800 dark:text-stone-300"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-stone-400">
                        {inviteRole === "editor" ? "Can create and edit tasks" : "Can view tasks only"}
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateInvite}
                      disabled={inviteLoading}
                      className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50"
                    >
                      {inviteLoading ? "Generating..." : "Generate invite link"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-stone-500">Share this link. It expires in 7 days.</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={inviteLink}
                        className="flex-1 min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs dark:border-stone-700 dark:bg-stone-800"
                      />
                      <button
                        onClick={handleCopy}
                        className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                          copied ? "bg-green-500 text-white" : "bg-amber-500 text-white hover:bg-amber-400"
                        }`}
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <button
                      onClick={() => setInviteLink(null)}
                      className="w-full rounded-xl border border-stone-200 py-2.5 text-sm text-stone-500 hover:bg-stone-50 dark:border-stone-700"
                    >
                      Generate new link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
