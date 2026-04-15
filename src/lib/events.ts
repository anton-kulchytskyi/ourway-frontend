import { apiFetch } from "./api";

export type EventEntry = {
  id: number;
  title: string;
  organization_id: number;
  date: string | null;         // "YYYY-MM-DD", null if flexible
  time_start: string | null;   // "HH:MM:SS"
  time_end: string | null;     // "HH:MM:SS"
  is_fixed: boolean;
  duration_min: number | null; // required when is_fixed=false
  find_before: string | null;  // "YYYY-MM-DD" deadline for flexible scheduling
  participants: number[];      // user ids
  created_by: number | null;
};

export type EventCreate = {
  title: string;
  date?: string | null;
  time_start?: string | null;
  time_end?: string | null;
  is_fixed?: boolean;
  duration_min?: number | null;
  find_before?: string | null;
  participants?: number[];
};

export type EventUpdate = Partial<EventCreate>;

export async function fetchEvents(
  token: string,
  date?: string
): Promise<EventEntry[]> {
  const q = date ? `?date=${date}` : "";
  return apiFetch<EventEntry[]>(`/events${q}`, { token });
}

export async function createEvent(
  token: string,
  body: EventCreate
): Promise<EventEntry> {
  return apiFetch<EventEntry>("/events", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export async function updateEvent(
  token: string,
  eventId: number,
  body: EventUpdate
): Promise<EventEntry> {
  return apiFetch<EventEntry>(`/events/${eventId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export async function deleteEvent(
  token: string,
  eventId: number
): Promise<void> {
  return apiFetch<void>(`/events/${eventId}`, {
    method: "DELETE",
    token,
  });
}
