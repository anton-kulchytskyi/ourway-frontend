"use client";

import { useState, useRef, useEffect } from "react";
import type { Task, TaskPriority } from "@/lib/tasks";
import { updateTask, deleteTask } from "@/lib/tasks";

type Props = {
  task: Task;
  token: string;
  onUpdated: (task: Task) => void;
  onDeleted: (taskId: number) => void;
  onClose: () => void;
};

export default function EditTaskSheet({ task, token, onUpdated, onDeleted, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      priority: fd.get("priority") as TaskPriority,
      points: Number(fd.get("points") || 0),
      due_date: (fd.get("due_date") as string) || null,
    };

    try {
      const updated = await updateTask(token, task.id, data);
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setError(e.detail ?? "Failed to update task");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(token, task.id);
      onDeleted(task.id);
      onClose();
    } catch {
      setError("Failed to delete task");
    }
  }

  const defaultDueDate = task.due_date ? task.due_date.split("T")[0] : "";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white dark:bg-stone-900 shadow-xl md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:rounded-2xl max-h-[90dvh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
          <div className="h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-600" />
        </div>

        <div className="overflow-y-auto px-5 pb-6 pt-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Edit Task</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={titleRef}
              name="title"
              required
              defaultValue={task.title}
              placeholder="Task title"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800"
            />

            <textarea
              name="description"
              defaultValue={task.description ?? ""}
              placeholder="Description (optional)"
              rows={2}
              className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800"
            />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Priority</label>
                <select
                  name="priority"
                  defaultValue={task.priority}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 dark:border-stone-700 dark:bg-stone-800"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Points</label>
                <input
                  name="points"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={task.points}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 dark:border-stone-700 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Due date</label>
                <input
                  name="due_date"
                  type="date"
                  defaultValue={defaultDueDate}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 dark:border-stone-700 dark:bg-stone-800"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
              >
                Delete
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>

        <div className="h-safe-bottom md:hidden shrink-0" />
      </div>
    </>
  );
}
