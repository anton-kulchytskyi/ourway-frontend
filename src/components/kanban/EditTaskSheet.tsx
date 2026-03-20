"use client";

import { useState, useRef, useEffect } from "react";
import type { Task, TaskPriority, TaskStatus } from "@/lib/tasks";
import { updateTask, deleteTask, STATUS_LABELS } from "@/lib/tasks";
import ConfirmModal from "@/components/ui/ConfirmModal";

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
  const [confirmDelete, setConfirmDelete] = useState(false);
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
      status: fd.get("status") as TaskStatus,
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
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 shadow-xl max-h-[90dvh] flex flex-col pointer-events-auto">
        <div className="overflow-y-auto px-5 pb-6 pt-5">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Status</label>
                <select
                  name="status"
                  defaultValue={task.status}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 dark:border-stone-700 dark:bg-stone-800"
                >
                  {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

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
            </div>

            <div className="grid grid-cols-2 gap-3">

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
                onClick={() => setConfirmDelete(true)}
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

        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Delete task?"
          message={`"${task.title}" will be permanently deleted.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
