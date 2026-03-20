import { apiFetch } from "./api";

export type SpaceMemberRole = "owner" | "editor" | "viewer";

export type Space = {
  id: number;
  name: string;
  emoji: string | null;
  organization_id: number;
  my_role: SpaceMemberRole | null;
};

export async function fetchSpaces(token: string): Promise<Space[]> {
  return apiFetch<Space[]>("/spaces", { token });
}

export async function createSpace(token: string, name: string, emoji: string | null): Promise<Space> {
  return apiFetch<Space>("/spaces", {
    method: "POST",
    token,
    body: JSON.stringify({ name, emoji }),
  });
}

export async function deleteSpace(token: string, id: number): Promise<void> {
  return apiFetch(`/spaces/${id}`, { method: "DELETE", token });
}
