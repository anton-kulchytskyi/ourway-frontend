import { apiFetch } from "./api";

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
};

export type Space = {
  id: number;
  name: string;
  emoji: string | null;
  organization_id: number;
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
