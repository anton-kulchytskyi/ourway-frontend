import { getAccessToken } from "@/lib/session";
import { getInvitation } from "@/lib/invitations";
import InviteClient from "./InviteClient";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ lang: string; token: string }>;
}) {
  const { lang, token } = await params;
  const authToken = await getAccessToken();

  let info = null;
  let error = null;

  try {
    info = await getInvitation(token);
  } catch (err: unknown) {
    const e = err as { detail?: string; status?: number };
    error = e.detail ?? "Invalid invitation";
  }

  return (
    <InviteClient
      info={info}
      error={error}
      inviteToken={token}
      authToken={authToken}
      lang={lang}
    />
  );
}
