import { apiFetch } from "./api";

export type FamilyMember = {
  id: number;
  email: string;
  name: string;
  role: "owner" | "member" | "child";
  locale: string;
  autonomy_level: number | null;
  created_by_id: number | null;
};

export async function fetchFamily(token: string): Promise<FamilyMember[]> {
  return apiFetch<FamilyMember[]>("/users/family", { token });
}

export async function createChild(
  token: string,
  data: { email: string; password: string; name: string; autonomy_level: number }
): Promise<FamilyMember> {
  return apiFetch<FamilyMember>("/users/children", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteChild(token: string, childId: number): Promise<void> {
  return apiFetch<void>(`/users/children/${childId}`, { method: "DELETE", token });
}

export async function updateChildAutonomy(
  token: string,
  childId: number,
  autonomy_level: number
): Promise<FamilyMember> {
  return apiFetch<FamilyMember>(`/users/children/${childId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ autonomy_level }),
  });
}
