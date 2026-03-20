"use client";

import { useState, useRef, useEffect } from "react";
import type { Space, Task, TaskStatus, TaskPriority } from "@/lib/tasks";
import { apiFetch } from "@/lib/api";

type Props = {
  spaces: Space[];
  token: string;
  defaultSpaceId?: number;
  onCreated: (task: Task) => void;
  onClose: () => void;
};

export default function CreateTaskSheet({ spaces, token, defaultSpaceId, onCreated, onClose }: Props) {
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
    const body = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      space_id: Number(fd.get("space_id")),
      priority: fd.get("priority") as TaskPriority,
      status: "backlog" as TaskStatus,
      points: Number(fd.get("points") || 0),
      due_date: (fd.get("due_date") as string) || null,
    };

    try {
      const task = await apiFetch<Task>("/tasks", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      });
      onCreated(task);
      onClose();
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setError(e.detail ?? "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 shadow-xl max-h-[90dvh] flex flex-col pointer-events-auto">

        <div className="px-5 pb-6 pt-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">New Task</h2>
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
            {/* Title */}
            <div>
              <input
                ref={titleRef}
                name="title"
                required
                placeholder="Task title"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800"
              />
            </div>

            {/* Description */}
            <div>
              <textarea
                name="description"
                placeholder="Description (optional)"
                rows={2}
                className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Space */}
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Space</label>
                <select
                  name="space_id"
                  defaultValue={defaultSpaceId ?? spaces[0]?.id}
                  required
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 dark:border-stone-700 dark:bg-stone-800"
                >
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.emoji} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Priority</label>
                <select
                  name="priority"
                  defaultValue="medium"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 dark:border-stone-700 dark:bg-stone-800"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Points */}
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Points</label>
                <input
                  name="points"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={0}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 dark:border-stone-700 dark:bg-stone-800"
                />
              </div>

              {/* Due date */}
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Due date</label>
                <input
                  name="due_date"
                  type="date"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 dark:border-stone-700 dark:bg-stone-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </form>
        </div>

        </div>
      </div>
    </>
  );
}
