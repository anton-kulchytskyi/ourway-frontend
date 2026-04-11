import { getAccessToken } from "@/lib/session";
import { getInvitation } from "@/lib/invitations";
import InviteClient from "./InviteClient";

const BOT_URL = process.env.NEXT_PUBLIC_TG_BOT_URL ?? "https://t.me/ourway_tasks_bot";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ lang: string; token: string }>;
}) {
  const { lang, token } = await params;
  const authToken = (await getAccessToken()) ?? null;

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
      botUrl={BOT_URL}
    />
  );
}
