"use client";

import { useState, useCallback } from "react";
import { createSchedule, updateSchedule, deleteSchedule, ScheduleEntry, ScheduleCreate } from "@/lib/schedule";
import type { FamilyMember } from "@/lib/family";

// ── Types ─────────────────────────────────────────────────────────────────────

type ScheduleDict = {
  title: string;
  addEntry: string;
  noEntries: string;
  entryTitle: string;
  entryTitlePlaceholder: string;
  weekdays: string;
  timeStart: string;
  timeEnd: string;
  validFrom: string;
  validUntil: string;
  forWhom: string;
  me: string;
  createEntry: string;
  creating: string;
  deleteConfirmTitle: string;
  deleteConfirmSuffix: string;
  loadError: string;
  days: Record<string, string>;
};

type CommonDict = {
  cancel: string;
  delete: string;
};

type ChildSchedules = { child: FamilyMember; entries: ScheduleEntry[] };

type Props = {
  mySchedules: ScheduleEntry[];
  childSchedules: ChildSchedules[];
  children: FamilyMember[];
  token: string;
  myUserId: number;
  isOwner: boolean;
  dict: ScheduleDict;
  commonDict: CommonDict;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 7];

function fmtTime(t: string): string {
  return t.slice(0, 5);
}

function fmtDate(d: string | null): string {
  if (!d) return "";
  return new Date(d + "T12:00:00").toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function WeekdayBadges({
  weekdays,
  days,
}: {
  weekdays: number[];
  days: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {DAY_ORDER.map((d) => (
        <span
          key={d}
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
            weekdays.includes(d)
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              : "bg-stone-100 text-stone-300 dark:bg-stone-800 dark:text-stone-600"
          }`}
        >
          {days[String(d)]}
        </span>
      ))}
    </div>
  );
}

// ── Single schedule entry card ────────────────────────────────────────────────

function EntryCard({
  entry,
  days,
  onEdit,
  onDelete,
}: {
  entry: ScheduleEntry;
  days: Record<string, string>;
  onEdit: (entry: ScheduleEntry) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="rounded-xl bg-stone-50 px-4 py-3 dark:bg-stone-800/60">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            {entry.title}
          </p>
          <p className="mt-0.5 text-xs font-mono text-stone-500 dark:text-stone-400">
            {fmtTime(entry.time_start)} – {fmtTime(entry.time_end)}
          </p>
          <div className="mt-1.5">
            <WeekdayBadges weekdays={entry.weekdays} days={days} />
          </div>
          {(entry.valid_from || entry.valid_until) && (
            <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
              {entry.valid_from && fmtDate(entry.valid_from)}
              {entry.valid_from && entry.valid_until && " – "}
              {entry.valid_until && fmtDate(entry.valid_until)}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onEdit(entry)}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-400 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-500 dark:hover:border-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-500 dark:hover:border-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Schedule form modal (create + edit) ──────────────────────────────────────

type ScheduleFormModalProps = {
  initial?: ScheduleEntry;           // present → edit mode
  children: FamilyMember[];
  isOwner: boolean;
  dict: ScheduleDict;
  commonDict: CommonDict;
  onClose: () => void;
  onCreated: (entry: ScheduleEntry, forUserId: number) => void;
  onUpdated: (entry: ScheduleEntry) => void;
  token: string;
  myUserId: number;
};

function ScheduleFormModal({
  initial,
  children,
  isOwner,
  dict,
  commonDict,
  onClose,
  onCreated,
  onUpdated,
  token,
  myUserId,
}: ScheduleFormModalProps) {
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    new Set(initial?.weekdays ?? [])
  );
  const [timeStart, setTimeStart] = useState(fmtTime(initial?.time_start ?? "08:00"));
  const [timeEnd, setTimeEnd] = useState(fmtTime(initial?.time_end ?? "09:00"));
  const [validFrom, setValidFrom] = useState(initial?.valid_from ?? "");
  const [validUntil, setValidUntil] = useState(initial?.valid_until ?? "");
  const [targetUserId, setTargetUserId] = useState<number>(initial?.user_id ?? myUserId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleDay(d: number) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (selectedDays.size === 0) {
      setError("Select at least one day");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isEdit && initial) {
        const updated = await updateSchedule(token, initial.id, {
          title: title.trim(),
          weekdays: Array.from(selectedDays).sort(),
          time_start: timeStart,
          time_end: timeEnd,
          valid_from: validFrom || null,
          valid_until: validUntil || null,
        });
        onUpdated(updated);
      } else {
        const body: ScheduleCreate = {
          title: title.trim(),
          weekdays: Array.from(selectedDays).sort(),
          time_start: timeStart,
          time_end: timeEnd,
          valid_from: validFrom || null,
          valid_until: validUntil || null,
          user_id: targetUserId !== myUserId ? targetUserId : null,
        };
        const created = await createSchedule(token, body);
        onCreated(created, targetUserId);
      }
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-xl">
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-50 mb-4">
          {isEdit ? title : dict.addEntry}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
              {dict.entryTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={dict.entryTitlePlaceholder}
              required
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
              {dict.weekdays}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAY_ORDER.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedDays.has(d)
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  }`}
                >
                  {dict.days[String(d)]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
                {dict.timeStart}
              </label>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:border-amber-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
                {dict.timeEnd}
              </label>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:border-amber-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
                {dict.validFrom}
              </label>
              <input
                type="date"
                value={validFrom ?? ""}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:border-amber-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
                {dict.validUntil}
              </label>
              <input
                type="date"
                value={validUntil ?? ""}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:border-amber-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>
          </div>

          {/* For whom — only in create mode */}
          {!isEdit && isOwner && children.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
                {dict.forWhom}
              </label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(Number(e.target.value))}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:border-amber-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              >
                <option value={myUserId}>{dict.me}</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              {commonDict.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-60"
            >
              {saving ? dict.creating : isEdit ? "Save" : dict.createEntry}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteConfirm({
  entryTitle,
  dict,
  commonDict,
  onConfirm,
  onCancel,
}: {
  entryTitle: string;
  dict: ScheduleDict;
  commonDict: CommonDict;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-xl">
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-50 mb-2">
          {dict.deleteConfirmTitle}
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          <span className="font-medium text-stone-700 dark:text-stone-200">{entryTitle}</span>{" "}
          {dict.deleteConfirmSuffix}
        </p>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            {commonDict.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-400"
          >
            {commonDict.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section of entries for one person ────────────────────────────────────────

function PersonSection({
  label,
  entries,
  days,
  dict,
  onEdit,
  onDelete,
}: {
  label: string;
  entries: ScheduleEntry[];
  days: Record<string, string>;
  dict: ScheduleDict;
  onEdit: (entry: ScheduleEntry) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">
        {label}
      </h3>
      {entries.length === 0 ? (
        <p className="text-sm text-stone-400 dark:text-stone-500">{dict.noEntries}</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id}>
              <EntryCard entry={e} days={days} onEdit={onEdit} onDelete={onDelete} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ScheduleClient({
  mySchedules: initialMySchedules,
  childSchedules: initialChildSchedules,
  children,
  token,
  myUserId,
  isOwner,
  dict,
  commonDict,
}: Props) {
  const [mySchedules, setMySchedules] = useState<ScheduleEntry[]>(initialMySchedules);
  const [childSchedules, setChildSchedules] = useState<ChildSchedules[]>(initialChildSchedules);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<ScheduleEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string; userId: number } | null>(null);

  const handleCreated = useCallback((entry: ScheduleEntry, forUserId: number) => {
    if (forUserId === myUserId) {
      setMySchedules((prev) => [...prev, entry]);
    } else {
      setChildSchedules((prev) =>
        prev.map((cs) =>
          cs.child.id === forUserId
            ? { ...cs, entries: [...cs.entries, entry] }
            : cs
        )
      );
    }
    setShowAdd(false);
  }, [myUserId]);

  const handleEditSaved = useCallback((updated: ScheduleEntry) => {
    const userId = updated.user_id;
    if (userId === myUserId) {
      setMySchedules((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } else {
      setChildSchedules((prev) =>
        prev.map((cs) =>
          cs.child.id === userId
            ? { ...cs, entries: cs.entries.map((e) => (e.id === updated.id ? updated : e)) }
            : cs
        )
      );
    }
    setEditTarget(null);
  }, [myUserId]);

  const handleDeleteRequest = useCallback((id: number, title: string, userId: number) => {
    setDeleteTarget({ id, title, userId });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const { id, userId } = deleteTarget;
    try {
      await deleteSchedule(token, id);
      if (userId === myUserId) {
        setMySchedules((prev) => prev.filter((e) => e.id !== id));
      } else {
        setChildSchedules((prev) =>
          prev.map((cs) =>
            cs.child.id === userId
              ? { ...cs, entries: cs.entries.filter((e) => e.id !== id) }
              : cs
          )
        );
      }
    } catch {
      // silently ignore — user can retry
    } finally {
      setDeleteTarget(null);
    }
  }, [token, deleteTarget, myUserId]);

  const hasAnything =
    mySchedules.length > 0 || childSchedules.some((cs) => cs.entries.length > 0);

  const showSections = isOwner && childSchedules.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">{dict.title}</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400"
        >
          + {dict.addEntry}
        </button>
      </div>

      {/* Content */}
      {!hasAnything && !showSections ? (
        <p className="mt-4 text-sm text-stone-400 dark:text-stone-500">{dict.noEntries}</p>
      ) : showSections ? (
        <div className="flex flex-col gap-6">
          <PersonSection
            label={dict.me}
            entries={mySchedules}
            days={dict.days}
            dict={dict}
            onEdit={setEditTarget}
            onDelete={(id) => handleDeleteRequest(id, mySchedules.find((e) => e.id === id)?.title ?? "", myUserId)}
          />
          {childSchedules.map(({ child, entries }) => (
            <PersonSection
              key={child.id}
              label={child.name}
              entries={entries}
              days={dict.days}
              dict={dict}
              onEdit={setEditTarget}
              onDelete={(id) => handleDeleteRequest(id, entries.find((e) => e.id === id)?.title ?? "", child.id)}
            />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {mySchedules.map((e) => (
            <li key={e.id}>
              <EntryCard
                entry={e}
                days={dict.days}
                onEdit={setEditTarget}
                onDelete={(id) => handleDeleteRequest(id, e.title, myUserId)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Add modal */}
      {showAdd && (
        <ScheduleFormModal
          children={children}
          isOwner={isOwner}
          dict={dict}
          commonDict={commonDict}
          onClose={() => setShowAdd(false)}
          onCreated={handleCreated}
          onUpdated={handleEditSaved}
          token={token}
          myUserId={myUserId}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <ScheduleFormModal
          initial={editTarget}
          children={children}
          isOwner={isOwner}
          dict={dict}
          commonDict={commonDict}
          onClose={() => setEditTarget(null)}
          onCreated={handleCreated}
          onUpdated={handleEditSaved}
          token={token}
          myUserId={myUserId}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          entryTitle={deleteTarget.title}
          dict={dict}
          commonDict={commonDict}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
