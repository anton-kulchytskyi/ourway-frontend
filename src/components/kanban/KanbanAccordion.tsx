"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/lib/tasks";
import { STATUSES, STATUS_LABELS } from "@/lib/tasks";

const HEADER_COLORS: Record<TaskStatus, string> = {
  backlog: "text-stone-500",
  todo: "text-blue-600 dark:text-blue-400",
  in_progress: "text-amber-600 dark:text-amber-400",
  blocked: "text-red-600 dark:text-red-400",
  done: "text-green-600 dark:text-green-400",
};

const BORDER_COLORS: Record<TaskStatus, string> = {
  backlog: "border-stone-200 dark:border-stone-700",
  todo: "border-blue-200 dark:border-blue-900",
  in_progress: "border-amber-300 dark:border-amber-800",
  blocked: "border-red-200 dark:border-red-900",
  done: "border-green-200 dark:border-green-900",
};

const PRIORITY_COLORS = {
  low: "bg-stone-100 text-stone-500",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-600",
};

type Props = {
  tasksByStatus: Record<TaskStatus, Task[]>;
  onViewTask: (task: Task) => void;
};

export default function KanbanAccordion({ tasksByStatus, onViewTask }: Props) {
  const [open, setOpen] = useState<TaskStatus | null>("todo");

  return (
    <div className="flex flex-col gap-2">
      {STATUSES.map((status) => {
        const isOpen = open === status;
        const tasks = tasksByStatus[status];

        return (
          <div key={status} className={`rounded-2xl border-2 bg-stone-50 dark:bg-stone-900 ${BORDER_COLORS[status]}`}>
            <button
              onClick={() => setOpen(isOpen ? null : status)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <span className={`text-sm font-semibold ${HEADER_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-stone-200 dark:bg-stone-700 px-2 py-0.5 text-xs font-medium text-stone-600 dark:text-stone-300">
                  {tasks.length}
                </span>
                <svg
                  className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="flex flex-col gap-2 px-3 pb-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                {tasks.length === 0 ? (
                  <p className="text-center text-xs text-stone-400 py-3">No tasks</p>
                ) : (
                  tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onViewTask(task)}
                      className="w-full text-left rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-3 shadow-sm"
                    >
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-100 leading-snug">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500 leading-snug line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.points > 0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                            {task.points}pts
                          </span>
                        )}
                        {task.due_date && (
                          <span className="text-xs text-stone-400">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
