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

export type SpaceMember = {
  id: number;
  space_id: number;
  user_id: number;
  role: SpaceMemberRole;
};

export async function fetchSpaceMembers(token: string, spaceId: number): Promise<SpaceMember[]> {
  return apiFetch<SpaceMember[]>(`/spaces/${spaceId}/members`, { token });
}

export async function addSpaceMember(token: string, spaceId: number, userId: number, role: SpaceMemberRole): Promise<SpaceMember> {
  return apiFetch<SpaceMember>(`/spaces/${spaceId}/members`, {
    method: "POST",
    token,
    body: JSON.stringify({ user_id: userId, role }),
  });
}

export async function removeSpaceMember(token: string, spaceId: number, userId: number): Promise<void> {
  return apiFetch(`/spaces/${spaceId}/members/${userId}`, { method: "DELETE", token });
}
