"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/lib/tasks";
import { STATUS_LABELS } from "@/lib/tasks";
import TaskCard from "./TaskCard";

const COLUMN_STYLES: Record<TaskStatus, string> = {
  backlog: "border-stone-200 dark:border-stone-700",
  todo: "border-blue-200 dark:border-blue-900",
  in_progress: "border-amber-300 dark:border-amber-800",
  blocked: "border-red-200 dark:border-red-900",
  done: "border-green-200 dark:border-green-900",
};

const HEADER_STYLES: Record<TaskStatus, string> = {
  backlog: "text-stone-500",
  todo: "text-blue-600 dark:text-blue-400",
  in_progress: "text-amber-600 dark:text-amber-400",
  blocked: "text-red-600 dark:text-red-400",
  done: "text-green-600 dark:text-green-400",
};

type Props = { status: TaskStatus; tasks: Task[] };

export default function KanbanColumn({ status, tasks }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={`flex flex-col rounded-2xl border-2 bg-stone-50 dark:bg-stone-900 min-w-[260px] w-[260px] flex-shrink-0 transition-colors ${COLUMN_STYLES[status]} ${isOver ? "bg-amber-50 dark:bg-stone-800" : ""}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-800">
        <span className={`text-sm font-semibold ${HEADER_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-700 dark:text-stone-300">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-2 p-3 min-h-[120px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
