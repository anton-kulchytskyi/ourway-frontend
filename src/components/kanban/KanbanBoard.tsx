"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import type { Task, TaskStatus, Space } from "@/lib/tasks";
import { STATUSES, updateTaskStatus } from "@/lib/tasks";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";

type Props = {
  initialTasks: Task[];
  spaces: Space[];
  token: string;
};

export default function KanbanBoard({ initialTasks, spaces, token }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(
    spaces[0]?.id ?? null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const visibleTasks = selectedSpace
    ? tasks.filter((t) => t.space_id === selectedSpace)
    : tasks;

  const tasksByStatus = STATUSES.reduce<Record<TaskStatus, Task[]>>(
    (acc, s) => ({ ...acc, [s]: visibleTasks.filter((t) => t.status === s) }),
    {} as Record<TaskStatus, Task[]>
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as number;
    const overId = over.id;

    const newStatus = STATUSES.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status;

    if (!newStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  }, [tasks]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as number;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      await updateTaskStatus(token, taskId, task.status);
    } catch {
      // revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: active.data.current?.status ?? t.status } : t))
      );
    }
  }, [tasks, token]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Space selector */}
      {spaces.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => setSelectedSpace(space.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                selectedSpace === space.id
                  ? "bg-amber-500 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-amber-100 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              {space.emoji && <span className="mr-1">{space.emoji}</span>}
              {space.name}
            </button>
          ))}
        </div>
      )}

      {spaces.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-400 dark:border-stone-700">
          No spaces yet. Create a space first.
        </div>
      )}

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveTask(tasks.find((t) => t.id === e.active.id) ?? null)}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <KanbanColumn key={status} status={status} tasks={tasksByStatus[status]} />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
