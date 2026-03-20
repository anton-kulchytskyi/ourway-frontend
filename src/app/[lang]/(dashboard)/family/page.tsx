import { getAccessToken, getSession } from "@/lib/session";
import { fetchFamily } from "@/lib/family";
import FamilyClient from "@/components/family/FamilyClient";
import { redirect } from "next/navigation";

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/login`);

  const user = await getSession();
  if (!user) redirect(`/${lang}/login`);

  const members = await fetchFamily(token).catch(() => []);

  return (
    <FamilyClient
      initialMembers={members}
      token={token}
      isOwner={user.role === "owner"}
      currentUserId={user.id}
    />
  );
}
