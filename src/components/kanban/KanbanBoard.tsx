"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
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
import { SortableContext } from "@dnd-kit/sortable";
import type { Task, TaskStatus, Space } from "@/lib/tasks";
import { STATUSES, updateTaskStatus, fetchTasks, requestTaskDone } from "@/lib/tasks";
import type { FamilyMember } from "@/lib/family";
import { useDict } from "@/lib/useDict";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import CreateTaskSheet from "./CreateTaskSheet";
import EditTaskSheet from "./EditTaskSheet";
import TaskViewSheet from "./TaskViewSheet";
import KanbanAccordion from "./KanbanAccordion";

type Props = {
  initialTasks: Task[];
  spaces: Space[];
  token: string;
  defaultSpaceId?: number | null;
  canDeleteTasks?: boolean;
  needsApproval?: boolean;
  familyMembers?: FamilyMember[];
  currentUserId?: number;
};

export default function KanbanBoard({ initialTasks, spaces, token, defaultSpaceId, canDeleteTasks = true, needsApproval = false, familyMembers, currentUserId }: Props) {
  const { lang } = useParams<{ lang: string }>();
  const t = useDict(lang).tasks;
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(defaultSpaceId ?? spaces[0]?.id ?? null);

  const canCreateTask = spaces.find((s) => s.id === selectedSpace)?.my_role !== "viewer";
  const [showCreate, setShowCreate] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const isDragging = useRef(false);
  const [requestedMsg, setRequestedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!requestedMsg) return;
    const timer = setTimeout(() => setRequestedMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [requestedMsg]);

  const reload = useCallback(async () => {
    if (isDragging.current) return;
    try {
      const fresh = await fetchTasks(token);
      setTasks(fresh);
    } catch {}
  }, [token]);

  // Refetch when tab becomes visible
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") reload();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [reload]);

  // Poll every 30s (only when tab is visible)
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, 30_000);
    return () => clearInterval(id);
  }, [reload]);

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
    const newStatus = STATUSES.includes(over.id as TaskStatus)
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === over.id)?.status;
    if (!newStatus) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  }, [tasks]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active } = event;
    isDragging.current = false;
    setActiveTask(null);
    const taskId = active.id as number;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (needsApproval && task.status === "done") {
      try {
        await requestTaskDone(token, taskId);
        setRequestedMsg(t.doneRequested);
      } catch {}
      reload();
      return;
    }

    try {
      await updateTaskStatus(token, taskId, task.status);
    } catch {
      reload();
    }
  }, [tasks, token, reload, needsApproval, t.doneRequested]);

  return (
    <div className="flex flex-col gap-4">
      {requestedMsg && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400">
          {requestedMsg}
        </div>
      )}
      {/* Space selector + Create button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
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

        {spaces.length > 0 && canCreateTask && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.newTask}
          </button>
        )}
      </div>

      {spaces.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-400 dark:border-stone-700">
          {t.noSpaces}
        </div>
      )}

      {/* Mobile: accordion */}
      {spaces.length > 0 && (
        <div className="md:hidden">
          <KanbanAccordion tasksByStatus={tasksByStatus} onViewTask={setViewingTask} />
        </div>
      )}

      {/* Desktop: Kanban board */}
      {spaces.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={(e) => {
            isDragging.current = true;
            setActiveTask(tasks.find((t) => t.id === e.active.id) ?? null);
          }}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="hidden md:flex gap-3 overflow-x-auto pb-4">
            {STATUSES.map((status) => (
              <KanbanColumn key={status} status={status} tasks={tasksByStatus[status]} onViewTask={setViewingTask} />
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
      )}

      {/* FAB for mobile */}
      {spaces.length > 0 && canCreateTask && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 shadow-lg text-white hover:bg-amber-400 transition-colors md:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}

      {/* Create sheet */}
      {showCreate && (
        <CreateTaskSheet
          spaces={spaces}
          token={token}
          defaultSpaceId={selectedSpace ?? undefined}
          familyMembers={familyMembers}
          currentUserId={currentUserId}
          onCreated={(task) => setTasks((prev) => [...prev, task])}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* View sheet */}
      {viewingTask && !editingTask && (
        <TaskViewSheet
          task={viewingTask}
          token={token}
          needsApproval={needsApproval}
          onUpdated={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setViewingTask(updated);
          }}
          onEdit={() => setEditingTask(viewingTask)}
          onClose={() => setViewingTask(null)}
          onDoneRequested={() => {
            setViewingTask(null);
            setRequestedMsg(t.doneRequested);
          }}
        />
      )}

      {/* Edit sheet */}
      {editingTask && (
        <EditTaskSheet
          task={editingTask}
          token={token}
          canDelete={canDeleteTasks}
          needsApproval={needsApproval}
          onDoneRequested={() => {
            setTasks((prev) => prev.map((t) => t.id === editingTask.id ? { ...t } : t));
            setEditingTask(null);
            setViewingTask(null);
            setRequestedMsg(t.doneRequested);
          }}
          onUpdated={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setViewingTask(null);
          }}
          onDeleted={(id) => {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            setViewingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
