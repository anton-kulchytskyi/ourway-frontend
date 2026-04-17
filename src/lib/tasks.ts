import { apiFetch } from "./api";
import type { Space } from "./spaces";
export type { Space };

export type TaskStatus = "backlog" | "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  points: number;
  due_date: string | null;
  space_id: number;
  creator_id: number;
  assignee_id: number | null;
  progress_current: number | null;
  progress_total: number | null;
};

export const STATUSES: TaskStatus[] = ["backlog", "todo", "in_progress", "blocked", "done"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

export async function fetchSpaces(token: string): Promise<Space[]> {
  return apiFetch<Space[]>("/spaces", { token });
}

export async function fetchTasks(token: string, spaceId?: number): Promise<Task[]> {
  const query = spaceId ? `?space_id=${spaceId}` : "";
  return apiFetch<Task[]>(`/tasks${query}`, { token });
}

export async function updateTaskStatus(token: string, taskId: number, status: TaskStatus): Promise<Task> {
  return apiFetch<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

export async function updateTask(
  token: string,
  taskId: number,
  data: Partial<Pick<Task, "title" | "description" | "status" | "priority" | "points" | "due_date" | "progress_current" | "progress_total">>
): Promise<Task> {
  return apiFetch<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteTask(token: string, taskId: number): Promise<void> {
  return apiFetch(`/tasks/${taskId}`, { method: "DELETE", token });
}
