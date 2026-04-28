"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import type { Task, TaskStatus } from "@/lib/tasks";
import { STATUSES, updateTaskStatus, requestTaskDone } from "@/lib/tasks";
import { useDict } from "@/lib/useDict";

const PRIORITY_COLORS = {
  low: "bg-stone-100 text-stone-500",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-600",
};

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  backlog: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
    </svg>
  ),
  todo: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  in_progress: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  blocked: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  done: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
};

type Props = {
  task: Task;
  token: string;
  needsApproval?: boolean;
  onUpdated: (task: Task) => void;
  onEdit: () => void;
  onClose: () => void;
  onDoneRequested?: () => void;
};

export default function TaskViewSheet({ task, token, needsApproval = false, onUpdated, onEdit, onClose, onDoneRequested }: Props) {
  const { lang } = useParams<{ lang: string }>();
  const dict = useDict(lang);
  const t = dict.tasks;
  const s = dict.statuses;

  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task.status);
  const [changing, setChanging] = useState<TaskStatus | null>(null);

  const statusLabels: Record<TaskStatus, string> = {
    backlog: s.backlog,
    todo: s.todo,
    in_progress: s.in_progress,
    blocked: s.blocked,
    done: s.done,
  };

  const priorityLabels = t.priorities;

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : null;

  async function handleStatusChange(status: TaskStatus) {
    if (status === currentStatus || changing) return;

    if (needsApproval && status === "done") {
      setChanging(status);
      try {
        await requestTaskDone(token, task.id);
        onDoneRequested?.();
        onClose();
      } finally {
        setChanging(null);
      }
      return;
    }

    setChanging(status);
    try {
      const updated = await updateTaskStatus(token, task.id, status);
      setCurrentStatus(status);
      onUpdated(updated);
    } finally {
      setChanging(null);
    }
  }

  return (
    <>
      <div className="modal-backdrop fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="modal-content w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 shadow-xl max-h-[90dvh] flex flex-col pointer-events-auto">
          <div className="overflow-y-auto px-5 pb-6 pt-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold leading-snug flex-1">{task.title}</h2>
              <button
                onClick={onClose}
                className="shrink-0 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {task.description && (
              <p className="mb-4 text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                {priorityLabels[task.priority]}
              </span>
              {task.points > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  {task.points} pts
                </span>
              )}
              {dueDate && (
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500 dark:bg-stone-800">
                  {dueDate}
                </span>
              )}
            </div>

            {/* Status picker */}
            <div className="flex justify-between mb-5 rounded-2xl bg-stone-100 dark:bg-stone-800 p-1.5">
              {STATUSES.map((status) => {
                const isActive = status === currentStatus;
                const isLoading = changing === status;
                return (
                  <button
                    key={status}
                    title={statusLabels[status]}
                    onClick={() => handleStatusChange(status)}
                    disabled={!!changing}
                    className={`flex-1 flex items-center justify-center rounded-xl p-2 transition-colors ${
                      isActive
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    } ${isLoading ? "opacity-50" : ""}`}
                  >
                    {STATUS_ICONS[status]}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onEdit}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-300 transition hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              {t.edit}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
