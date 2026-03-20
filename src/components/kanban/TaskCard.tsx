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
  onView?: () => void;
};

export default function TaskCard({ task, onView }: Props) {
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
      onClick={() => !isDragging && onView?.()}
      className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing dark:border-stone-700 dark:bg-stone-800 select-none"
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
    </div>
  );
}
