"use client";

import { useState } from "react";
import type { Space, SpaceMember, SpaceMemberRole } from "@/lib/spaces";
import { createSpace, deleteSpace, fetchSpaceMembers, addSpaceMember, removeSpaceMember } from "@/lib/spaces";
import { createInvitation, type InvitationRole } from "@/lib/invitations";
import type { FamilyMember } from "@/lib/family";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "");

const EMOJIS = ["🏠", "👨‍👩‍👧", "💼", "📚", "🛒", "🌿", "🎯", "⭐", "🚗", "💪"];

type Props = { initialSpaces: Space[]; token: string; lang: string; familyMembers: FamilyMember[]; currentUserId: number };

export default function SpacesClient({ initialSpaces, token, lang, familyMembers, currentUserId }: Props) {
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Space | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏠");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Members modal
  const [membersSpace, setMembersSpace] = useState<Space | null>(null);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [addingUserId, setAddingUserId] = useState<number | null>(null);
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);

  // Invite via link
  const [inviteRole, setInviteRole] = useState<InvitationRole>("editor");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function openMembers(space: Space) {
    setMembersSpace(space);
    setMembersError(null);
    setMembersLoading(true);
    try {
      const m = await fetchSpaceMembers(token, space.id);
      setMembers(m);
    } catch {
      setMembersError("Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  }

  function closeMembers() {
    setMembersSpace(null);
    setMembers([]);
    setMembersError(null);
    setInviteLink(null);
    setCopied(false);
  }

  async function handleGenerateInvite() {
    if (!membersSpace) return;
    setInviteLoading(true);
    setMembersError(null);
    try {
      const inv = await createInvitation(token, membersSpace.id, inviteRole);
      setInviteLink(`${APP_URL}/en/invite/${inv.token}`);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setMembersError(e.detail ?? "Failed to create invitation");
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

  async function handleAddMember(userId: number, role: SpaceMemberRole) {
    if (!membersSpace) return;
    setAddingUserId(userId);
    setMembersError(null);
    try {
      const m = await addSpaceMember(token, membersSpace.id, userId, role);
      setMembers((prev) => [...prev, m]);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setMembersError(e.detail ?? "Failed to add member");
    } finally {
      setAddingUserId(null);
    }
  }

  async function handleRemoveMember(userId: number) {
    if (!membersSpace) return;
    setRemovingUserId(userId);
    setMembersError(null);
    try {
      await removeSpaceMember(token, membersSpace.id, userId);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setMembersError(e.detail ?? "Failed to remove member");
    } finally {
      setRemovingUserId(null);
    }
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

  // Family members not yet in the space
  const nonMembers = membersSpace
    ? familyMembers.filter(
        (fm) => fm.id !== currentUserId && !members.some((m) => m.user_id === fm.id)
      )
    : [];

  const memberUserIds = new Set(members.map((m) => m.user_id));

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
        <SpaceGroups spaces={spaces} lang={lang} onMembers={openMembers} onDelete={setConfirmDelete} />
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

      {/* Members modal */}
      {membersSpace && (
        <>
          <div className="modal-backdrop fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closeMembers} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="modal-content w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 shadow-xl max-h-[90dvh] flex flex-col pointer-events-auto">
              <div className="overflow-y-auto px-5 pb-6 pt-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">
                    {membersSpace.emoji} {membersSpace.name}
                  </h2>
                  <button onClick={closeMembers} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {membersError && (
                  <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{membersError}</p>
                )}

                {membersLoading ? (
                  <p className="text-sm text-stone-400 text-center py-4">Loading...</p>
                ) : (
                  <div className="space-y-4">
                    {/* Current members */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Members</p>
                      <div className="flex flex-col gap-2">
                        {members.map((m) => {
                          const fm = familyMembers.find((f) => f.id === m.user_id);
                          const isMe = m.user_id === currentUserId;
                          return (
                            <div key={m.id} className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2.5 dark:bg-stone-800">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                {(fm?.name ?? "?")[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">
                                  {fm?.name ?? `User ${m.user_id}`}
                                  {isMe && <span className="ml-1 text-stone-400 font-normal">(you)</span>}
                                </span>
                                <span className="text-xs text-stone-400 capitalize">{m.role}</span>
                              </div>
                              {!isMe && m.role !== "owner" && (
                                <button
                                  onClick={() => handleRemoveMember(m.user_id)}
                                  disabled={removingUserId === m.user_id}
                                  className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 disabled:opacity-50"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add members */}
                    {nonMembers.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Add from family</p>
                        <div className="flex flex-col gap-2">
                          {nonMembers.map((fm) => (
                            <div key={fm.id} className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2.5 dark:bg-stone-800">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-sm font-bold text-stone-500 dark:bg-stone-700">
                                {fm.name[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">{fm.name}</span>
                                <span className="text-xs text-stone-400 capitalize">{fm.role}</span>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => handleAddMember(fm.id, "editor")}
                                  disabled={addingUserId === fm.id}
                                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium bg-amber-500 text-white hover:bg-amber-400 disabled:opacity-50 transition-colors"
                                >
                                  Editor
                                </button>
                                <button
                                  onClick={() => handleAddMember(fm.id, "viewer")}
                                  disabled={addingUserId === fm.id}
                                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300 disabled:opacity-50 transition-colors"
                                >
                                  Viewer
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Invite external */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Invite external</p>
                      {!inviteLink ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            {(["editor", "viewer"] as InvitationRole[]).map((r) => (
                              <button
                                key={r}
                                onClick={() => setInviteRole(r)}
                                className={`flex-1 rounded-xl py-2 text-xs font-medium capitalize transition-colors ${
                                  inviteRole === r
                                    ? "bg-amber-500 text-white"
                                    : "bg-stone-100 text-stone-500 hover:bg-amber-100 dark:bg-stone-700 dark:text-stone-400"
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={handleGenerateInvite}
                            disabled={inviteLoading}
                            className="w-full rounded-xl border border-stone-200 py-2.5 text-xs font-medium text-stone-500 hover:bg-stone-50 dark:border-stone-700 disabled:opacity-50"
                          >
                            {inviteLoading ? "Generating..." : "Generate invite link"}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-stone-400">Share this link. Expires in 7 days.</p>
                          <div className="flex gap-2">
                            <input
                              readOnly
                              value={inviteLink}
                              className="flex-1 min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-stone-700 dark:bg-stone-800"
                            />
                            <button
                              onClick={handleCopy}
                              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                                copied ? "bg-green-500 text-white" : "bg-amber-500 text-white hover:bg-amber-400"
                              }`}
                            >
                              {copied ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          <button
                            onClick={() => setInviteLink(null)}
                            className="w-full rounded-xl border border-stone-200 py-2 text-xs text-stone-400 hover:bg-stone-50 dark:border-stone-700"
                          >
                            Generate new link
                          </button>
                        </div>
                      )}
                    </div>
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

function SpaceCard({ space, lang, onMembers, onDelete }: {
  space: Space;
  lang: string;
  onMembers: (s: Space) => void;
  onDelete: (s: Space) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <Link href={`/${lang}/tasks?space=${space.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-2xl">{space.emoji ?? "📋"}</span>
        <div className="min-w-0">
          <span className="font-medium truncate block">{space.name}</span>
          {space.my_role && space.my_role !== "owner" && (
            <span className="text-xs text-stone-400 capitalize">{space.my_role}</span>
          )}
        </div>
      </Link>
      {space.my_role === "owner" && (
        <div className="flex items-center gap-1 ml-3">
          <button
            onClick={() => onMembers(space)}
            className="rounded-lg p-2 text-stone-400 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-950 transition-colors"
            title="Manage members"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(space)}
            className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function SpaceGroups({ spaces, lang, onMembers, onDelete }: {
  spaces: Space[];
  lang: string;
  onMembers: (s: Space) => void;
  onDelete: (s: Space) => void;
}) {
  const mySpaces = spaces.filter((s) => s.my_role === "owner");
  const sharedSpaces = spaces.filter((s) => s.my_role !== "owner");

  // Group shared by owner name
  const sharedByOwner = sharedSpaces.reduce<Record<string, Space[]>>((acc, s) => {
    const key = s.owner_name ?? "Shared";
    acc[key] = [...(acc[key] ?? []), s];
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      {mySpaces.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">My spaces</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {mySpaces.map((s) => <SpaceCard key={s.id} space={s} lang={lang} onMembers={onMembers} onDelete={onDelete} />)}
          </div>
        </div>
      )}

      {Object.entries(sharedByOwner).map(([ownerName, ownerSpaces]) => (
        <div key={ownerName}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{ownerName}&apos;s spaces</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ownerSpaces.map((s) => <SpaceCard key={s.id} space={s} lang={lang} onMembers={onMembers} onDelete={onDelete} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
