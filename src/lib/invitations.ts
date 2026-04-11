import { apiFetch } from "./api";

export type InvitationRole = "editor" | "viewer";

export type InvitationPublicInfo = {
  token: string;
  org_name: string;
  space_name: string | null;
  space_emoji: string | null;
  invited_by_name: string;
  expires_at: string;
};

export type InvitationResponse = {
  id: number;
  token: string;
  space_id: number;
  org_id: number;
  role: InvitationRole;
  status: string;
  expires_at: string;
};

export async function createInvitation(
  token: string,
  space_id: number,
  role: InvitationRole
): Promise<InvitationResponse> {
  return apiFetch<InvitationResponse>("/invitations", {
    method: "POST",
    token,
    body: JSON.stringify({ space_id, role }),
  });
}

export async function getInvitation(inviteToken: string): Promise<InvitationPublicInfo> {
  return apiFetch<InvitationPublicInfo>(`/invitations/${inviteToken}`);
}

export async function acceptInvitation(inviteToken: string, authToken: string): Promise<void> {
  return apiFetch(`/invitations/${inviteToken}/accept`, {
    method: "POST",
    token: authToken,
  });
}
