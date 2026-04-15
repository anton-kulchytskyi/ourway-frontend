"use client";

import { useState, useCallback } from "react";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  EventEntry,
  EventCreate,
  EventUpdate,
} from "@/lib/events";
import type { FamilyMember } from "@/lib/family";

// ── Types ─────────────────────────────────────────────────────────────────────

type EventsDict = {
  title: string;
  addEvent: string;
  noEvents: string;
  eventTitle: string;
  eventTitlePlaceholder: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  participants: string;
  createEvent: string;
  creating: string;
  save: string;
  saving: string;
  deleteConfirmTitle: string;
  deleteConfirmSuffix: string;
  past: string;
  upcoming: string;
  noDate: string;
  you: string;
};

type CommonDict = {
  cancel: string;
  delete: string;
};

type Props = {
  events: EventEntry[];
  family: FamilyMember[];
  token: string;
  myUserId: number;
  isChild: boolean;
  dict: EventsDict;
  commonDict: CommonDict;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtTime(t: string | null): string {
  if (!t) return "";
  return t.slice(0, 5);
}

function fmtDate(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isDatePast(d: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(d + "T12:00:00") < today;
}

function groupByDate(events: EventEntry[]): { date: string | null; items: EventEntry[] }[] {
  const fixed = events.filter((e) => e.date !== null);
  const flexible = events.filter((e) => e.date === null);

  // Sort fixed by date
  fixed.sort((a, b) => (a.date! < b.date! ? -1 : 1));

  const map = new Map<string, EventEntry[]>();
  for (const e of fixed) {
    const d = e.date!;
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(e);
  }

  const groups: { date: string | null; items: EventEntry[] }[] = [];
  for (const [date, items] of map) {
    groups.push({ date, items });
  }
  if (flexible.length > 0) {
    groups.push({ date: null, items: flexible });
  }
  return groups;
}

// ── Event card ────────────────────────────────────────────────────────────────

function EventCard({
  event,
  family,
  myUserId,
  dict,
  canEdit,
  onEdit,
  onDelete,
}: {
  event: EventEntry;
  family: FamilyMember[];
  myUserId: number;
  dict: EventsDict;
  canEdit: boolean;
  onEdit: (e: EventEntry) => void;
  onDelete: (e: EventEntry) => void;
}) {
  const participantNames = (event.participants ?? []).map((pid) => {
    if (pid === myUserId) return dict.you;
    return family.find((m) => m.id === pid)?.name ?? `#${pid}`;
  });

  const past = event.date ? isDatePast(event.date) : false;

  return (
    <div
      className={`rounded-xl px-4 py-3 ${
        past
          ? "bg-stone-50 opacity-60 dark:bg-stone-800/40"
          : "bg-stone-50 dark:bg-stone-800/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            {event.title}
          </p>
          {(event.time_start || event.time_end) && (
            <p className="mt-0.5 text-xs font-mono text-stone-500 dark:text-stone-400">
              {fmtTime(event.time_start)}
              {event.time_end && ` – ${fmtTime(event.time_end)}`}
            </p>
          )}
          {participantNames.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {participantNames.map((name, i) => (
                <span
                  key={i}
                  className="rounded px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
        {canEdit && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => onEdit(event)}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-400 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-500 dark:hover:border-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
            >
              ✎
            </button>
            <button
              onClick={() => onDelete(event)}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-500 dark:hover:border-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Event form modal (create + edit) ──────────────────────────────────────────

type EventFormModalProps = {
  initial?: EventEntry;
  family: FamilyMember[];
  myUserId: number;
  token: string;
  dict: EventsDict;
  commonDict: CommonDict;
  onClose: () => void;
  onCreated: (e: EventEntry) => void;
  onUpdated: (e: EventEntry) => void;
};

function EventFormModal({
  initial,
  family,
  myUserId,
  token,
  dict,
  commonDict,
  onClose,
  onCreated,
  onUpdated,
}: EventFormModalProps) {
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [timeStart, setTimeStart] = useState(fmtTime(initial?.time_start ?? null));
  const [timeEnd, setTimeEnd] = useState(fmtTime(initial?.time_end ?? null));
  const [participants, setParticipants] = useState<Set<number>>(
    new Set(initial?.participants ?? [myUserId])
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleParticipant(id: number) {
    setParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const body: EventCreate | EventUpdate = {
        title: title.trim(),
        date: date || null,
        time_start: timeStart || null,
        time_end: timeEnd || null,
        participants: Array.from(participants),
      };

      if (isEdit && initial) {
        const updated = await updateEvent(token, initial.id, body as EventUpdate);
        onUpdated(updated);
      } else {
        const created = await createEvent(token, body as EventCreate);
        onCreated(created);
      }
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const allMembers = [
    { id: myUserId, name: dict.you },
    ...family.map((m) => ({ id: m.id, name: m.name })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-xl max-h-[90dvh] overflow-y-auto">
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-50 mb-4">
          {isEdit ? initial!.title : dict.addEvent}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
              {dict.eventTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={dict.eventTitlePlaceholder}
              required
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
              {dict.date}
            </label>
            <input
              type="date"
              value={date ?? ""}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:border-amber-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
          </div>

          {/* Time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
                {dict.timeStart}
              </label>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
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
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:border-amber-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Participants */}
          {allMembers.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">
                {dict.participants}
              </label>
              <div className="flex flex-col gap-1.5">
                {allMembers.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 cursor-pointer hover:border-amber-300 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-amber-700"
                  >
                    <input
                      type="checkbox"
                      checked={participants.has(m.id)}
                      onChange={() => toggleParticipant(m.id)}
                      className="h-4 w-4 rounded border-stone-300 accent-amber-500"
                    />
                    <span className="text-sm text-stone-700 dark:text-stone-200">{m.name}</span>
                  </label>
                ))}
              </div>
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
              {saving
                ? (isEdit ? dict.saving : dict.creating)
                : (isEdit ? dict.save : dict.createEvent)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function DeleteConfirm({
  eventTitle,
  dict,
  commonDict,
  onConfirm,
  onCancel,
}: {
  eventTitle: string;
  dict: EventsDict;
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
          <span className="font-medium text-stone-700 dark:text-stone-200">{eventTitle}</span>{" "}
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

// ── Main component ────────────────────────────────────────────────────────────

export default function EventsClient({
  events: initialEvents,
  family,
  token,
  myUserId,
  isChild,
  dict,
  commonDict,
}: Props) {
  const [events, setEvents] = useState<EventEntry[]>(initialEvents);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<EventEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventEntry | null>(null);

  const handleCreated = useCallback((e: EventEntry) => {
    setEvents((prev) => [...prev, e]);
    setShowAdd(false);
  }, []);

  const handleUpdated = useCallback((updated: EventEntry) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditTarget(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteEvent(token, deleteTarget.id);
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    } catch {
      // silently ignore — user can retry
    } finally {
      setDeleteTarget(null);
    }
  }, [token, deleteTarget]);

  const groups = groupByDate(events);
  const canEdit = !isChild;

  // Split groups into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingGroups = groups.filter(
    (g) => g.date === null || new Date(g.date + "T12:00:00") >= today
  );
  const pastGroups = groups.filter(
    (g) => g.date !== null && new Date(g.date + "T12:00:00") < today
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">{dict.title}</h1>
        {canEdit && (
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400"
          >
            + {dict.addEvent}
          </button>
        )}
      </div>

      {/* Upcoming */}
      {upcomingGroups.length === 0 && pastGroups.length === 0 ? (
        <p className="mt-4 text-sm text-stone-400 dark:text-stone-500">{dict.noEvents}</p>
      ) : (
        <>
          {upcomingGroups.length > 0 && (
            <div className="flex flex-col gap-4">
              {upcomingGroups.map((group) => (
                <div key={group.date ?? "flexible"}>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">
                    {group.date ? fmtDate(group.date) : dict.noDate}
                  </h3>
                  <ul className="space-y-2">
                    {group.items.map((e) => (
                      <li key={e.id}>
                        <EventCard
                          event={e}
                          family={family}
                          myUserId={myUserId}
                          dict={dict}
                          canEdit={canEdit}
                          onEdit={setEditTarget}
                          onDelete={setDeleteTarget}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Past events (collapsed section) */}
          {pastGroups.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 select-none">
                {dict.past} ({pastGroups.reduce((acc, g) => acc + g.items.length, 0)})
              </summary>
              <div className="mt-3 flex flex-col gap-4">
                {pastGroups.map((group) => (
                  <div key={group.date!}>
                    <h3 className="text-xs font-medium text-stone-400 dark:text-stone-500 mb-2">
                      {fmtDate(group.date!)}
                    </h3>
                    <ul className="space-y-2">
                      {group.items.map((e) => (
                        <li key={e.id}>
                          <EventCard
                            event={e}
                            family={family}
                            myUserId={myUserId}
                            dict={dict}
                            canEdit={canEdit}
                            onEdit={setEditTarget}
                            onDelete={setDeleteTarget}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {/* Add modal */}
      {showAdd && (
        <EventFormModal
          family={family}
          myUserId={myUserId}
          token={token}
          dict={dict}
          commonDict={commonDict}
          onClose={() => setShowAdd(false)}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <EventFormModal
          initial={editTarget}
          family={family}
          myUserId={myUserId}
          token={token}
          dict={dict}
          commonDict={commonDict}
          onClose={() => setEditTarget(null)}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          eventTitle={deleteTarget.title}
          dict={dict}
          commonDict={commonDict}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
