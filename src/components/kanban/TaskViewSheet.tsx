"use client";

import type { Task } from "@/lib/tasks";
import { STATUS_LABELS } from "@/lib/tasks";

const PRIORITY_COLORS = {
  low: "bg-stone-100 text-stone-500",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-600",
};

type Props = {
  task: Task;
  onEdit: () => void;
  onClose: () => void;
};

export default function TaskViewSheet({ task, onEdit, onClose }: Props) {
  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white dark:bg-stone-900 shadow-xl md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:rounded-2xl max-h-[90dvh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
          <div className="h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-600" />
        </div>

        <div className="overflow-y-auto px-5 pb-6 pt-3">
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

          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500 dark:bg-stone-800">
              {STATUS_LABELS[task.status]}
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

          <button
            onClick={onEdit}
            className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400"
          >
            Edit
          </button>
        </div>

        <div className="h-safe-bottom md:hidden shrink-0" />
      </div>
    </>
  );
}
