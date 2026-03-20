"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/tasks";

const PRIORITY_COLORS = {
  low: "bg-stone-100 text-stone-500 dark:bg-stone-800",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  high: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
};

type Props = {
  task: Task;
  onEdit?: () => void;
};

export default function TaskCard({ task, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing dark:border-stone-700 dark:bg-stone-800 select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-stone-800 dark:text-stone-100 leading-snug flex-1">
          {task.title}
        </p>
        {onEdit && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="shrink-0 rounded-lg p-1 text-stone-300 hover:bg-stone-100 hover:text-stone-500 dark:hover:bg-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
          </button>
        )}
      </div>

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
    </div>
  );
}
