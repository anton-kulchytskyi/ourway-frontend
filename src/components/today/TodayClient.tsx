"use client";

import { useState, useCallback } from "react";
import { updateTaskStatus } from "@/lib/tasks";
import { confirmDay, DayView, FamilyMemberDay, DayPlan } from "@/lib/today";

// ── Types ─────────────────────────────────────────────────────────────────────

type TodayDict = {
  title: string;
  planStatus: { draft: string; confirmed: string; completed: string };
  confirmPlan: string;
  confirming: string;
  schedule: string;
  events: string;
  tasks: string;
  nothingPlanned: string;
  me: string;
  markDone: string;
  loadError: string;
};

type Props = {
  date: string;
  myDay: DayView | null;
  familyDay: FamilyMemberDay[] | null;
  token: string;
  myUserId: number;
  myName: string;
  dict: TodayDict;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtTime(t: string | null): string {
  if (!t) return "";
  return t.slice(0, 5);
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status, dict }: { status: string; dict: TodayDict["planStatus"] }) {
  const styles: Record<string, string> = {
    draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    confirmed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    completed: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
  };
  const label = dict[status as keyof typeof dict] ?? status;
  const cls = styles[status] ?? styles.draft;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2 mt-5">
      <span>{icon}</span>
      {label}
    </h3>
  );
}

function TimeChip({ time }: { time: string }) {
  if (!time) return null;
  return (
    <span className="shrink-0 text-xs font-mono text-stone-400 dark:text-stone-500 w-10">
      {time}
    </span>
  );
}

// ── DayView renderer ──────────────────────────────────────────────────────────

type DayProps = {
  day: DayView;
  token: string;
  dict: TodayDict;
  onTaskDone: (taskId: number) => void;
  tasksDone: Set<number>;
};

function DayViewRenderer({ day, dict, onTaskDone, tasksDone }: DayProps) {
  const { schedule_items, events, tasks } = day;
  const isEmpty = schedule_items.length === 0 && events.length === 0 && tasks.length === 0;

  if (isEmpty) {
    return (
      <p className="mt-6 text-center text-sm text-stone-400 dark:text-stone-500">
        {dict.nothingPlanned}
      </p>
    );
  }

  return (
    <div>
      {schedule_items.length > 0 && (
        <>
          <SectionTitle icon="🕐" label={dict.schedule} />
          <ul className="space-y-1.5">
            {schedule_items.map((s, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-2.5 dark:bg-stone-800/60"
              >
                <TimeChip time={fmtTime(s.time_start)} />
                <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                  {s.title}
                </span>
                {s.time_end && (
                  <span className="ml-auto text-xs text-stone-400 dark:text-stone-500">
                    –{fmtTime(s.time_end)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {events.length > 0 && (
        <>
          <SectionTitle icon="📅" label={dict.events} />
          <ul className="space-y-1.5">
            {events.map((e) => (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-2.5 dark:bg-stone-800/60"
              >
                <TimeChip time={fmtTime(e.time_start)} />
                <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                  {e.title}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {tasks.length > 0 && (
        <>
          <SectionTitle icon="📝" label={dict.tasks} />
          <ul className="space-y-1.5">
            {tasks.map((task) => {
              const done = tasksDone.has(task.id) || task.status === "done";
              return (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-2.5 dark:bg-stone-800/60"
                >
                  <TimeChip time={fmtTime(task.time_start)} />
                  <span
                    className={`flex-1 text-sm font-medium ${
                      done
                        ? "line-through text-stone-400 dark:text-stone-500"
                        : "text-stone-700 dark:text-stone-200"
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.points > 0 && !done && (
                    <span className="text-xs text-amber-500 font-semibold">
                      +{task.points}
                    </span>
                  )}
                  {!done && (
                    <button
                      onClick={() => onTaskDone(task.id)}
                      className="shrink-0 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-500 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                    >
                      {dict.markDone}
                    </button>
                  )}
                  {done && (
                    <span className="shrink-0 text-green-500">✓</span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TodayClient({
  date,
  myDay,
  familyDay,
  token,
  myUserId,
  myName,
  dict,
}: Props) {
  const [selectedUserId, setSelectedUserId] = useState<number>(myUserId);
  const [plans, setPlans] = useState<Record<number, DayPlan>>(() => {
    const init: Record<number, DayPlan> = {};
    if (myDay) init[myUserId] = myDay.plan;
    familyDay?.forEach((m) => { init[m.user_id] = m.day.plan; });
    return init;
  });
  const [tasksDone, setTasksDone] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState(false);

  // Current day being viewed
  const currentDay: DayView | null =
    selectedUserId === myUserId
      ? myDay
      : familyDay?.find((m) => m.user_id === selectedUserId)?.day ?? null;

  const currentPlan = plans[selectedUserId] ?? currentDay?.plan;

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    try {
      const updated = await confirmDay(token, date);
      setPlans((prev) => ({ ...prev, [myUserId]: updated }));
    } catch {
      // silently ignore — user can retry
    } finally {
      setConfirming(false);
    }
  }, [token, date, myUserId]);

  const handleTaskDone = useCallback(async (taskId: number) => {
    setTasksDone((prev) => new Set(prev).add(taskId));
    try {
      await updateTaskStatus(token, taskId, "done");
    } catch {
      setTasksDone((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  }, [token]);

  const isOwnDay = selectedUserId === myUserId;
  const canConfirm =
    isOwnDay && currentPlan?.status === "draft";

  // Family tabs (owner only)
  const familyMembers = familyDay
    ? [
        { user_id: myUserId, user_name: myName },
        ...familyDay
          .filter((m) => m.user_id !== myUserId)
          .map((m) => ({ user_id: m.user_id, user_name: m.user_name })),
      ]
    : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">
            {dict.title}
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 capitalize">
            {fmtDate(date)}
          </p>
        </div>
        {currentPlan && (
          <StatusBadge status={currentPlan.status} dict={dict.planStatus} />
        )}
      </div>

      {/* Family member tabs (owner with children) */}
      {familyMembers && familyMembers.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {familyMembers.map((m) => (
            <button
              key={m.user_id}
              onClick={() => setSelectedUserId(m.user_id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedUserId === m.user_id
                  ? "bg-amber-500 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              }`}
            >
              {m.user_id === myUserId ? dict.me : m.user_name}
            </button>
          ))}
        </div>
      )}

      {/* Error state */}
      {!currentDay && (
        <p className="mt-4 text-sm text-red-500">{dict.loadError}</p>
      )}

      {/* Day content */}
      {currentDay && (
        <DayViewRenderer
          day={currentDay}
          token={token}
          dict={dict}
          onTaskDone={handleTaskDone}
          tasksDone={tasksDone}
        />
      )}

      {/* Confirm button */}
      {canConfirm && (
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="mt-6 w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-400 disabled:opacity-60"
        >
          {confirming ? dict.confirming : dict.confirmPlan}
        </button>
      )}
    </div>
  );
}
