import { apiFetch } from "./api";

export type ScheduleEntry = {
  id: number;
  title: string;
  weekdays: number[]; // 1=Mon … 7=Sun
  time_start: string; // "HH:MM:SS"
  time_end: string;
  valid_from: string | null;
  valid_until: string | null;
  user_id: number;
  created_by: number | null;
};

export type ScheduleCreate = {
  title: string;
  weekdays: number[];
  time_start: string;
  time_end: string;
  valid_from?: string | null;
  valid_until?: string | null;
  user_id?: number | null;
};

export async function fetchSchedules(
  token: string,
  userId?: number
): Promise<ScheduleEntry[]> {
  const q = userId ? `?user_id=${userId}` : "";
  return apiFetch<ScheduleEntry[]>(`/schedule${q}`, { token });
}

export async function createSchedule(
  token: string,
  body: ScheduleCreate
): Promise<ScheduleEntry> {
  return apiFetch<ScheduleEntry>("/schedule", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export type ScheduleUpdate = Partial<Omit<ScheduleCreate, "user_id">>;

export async function updateSchedule(
  token: string,
  scheduleId: number,
  body: ScheduleUpdate
): Promise<ScheduleEntry> {
  return apiFetch<ScheduleEntry>(`/schedule/${scheduleId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export async function deleteSchedule(
  token: string,
  scheduleId: number
): Promise<void> {
  return apiFetch<void>(`/schedule/${scheduleId}`, {
    method: "DELETE",
    token,
  });
}
