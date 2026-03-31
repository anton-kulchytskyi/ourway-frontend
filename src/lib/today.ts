import { apiFetch } from "./api";

export type ScheduleItem = {
  title: string;
  time_start: string | null;
  time_end: string | null;
};

export type EventItem = {
  id: number;
  title: string;
  time_start: string | null;
  time_end: string | null;
};

export type DayTask = {
  id: number;
  title: string;
  status: string;
  time_start: string | null;
  points: number;
};

export type DayPlan = {
  id: number | null;
  status: "draft" | "confirmed" | "completed";
  date: string;
};

export type DayView = {
  plan: DayPlan;
  schedule_items: ScheduleItem[];
  events: EventItem[];
  tasks: DayTask[];
};

export type FamilyMemberDay = {
  user_id: number;
  user_name: string;
  role: string;
  day: DayView;
};

export async function fetchDay(token: string, date: string): Promise<DayView> {
  return apiFetch<DayView>(`/day?date=${date}`, { token });
}

export async function confirmDay(token: string, date: string): Promise<DayPlan> {
  return apiFetch<DayPlan>("/day/confirm", {
    method: "POST",
    token,
    body: JSON.stringify({ date }),
  });
}

export async function fetchFamilyDay(token: string, date: string): Promise<FamilyMemberDay[]> {
  return apiFetch<FamilyMemberDay[]>(`/day/family?date=${date}`, { token });
}
