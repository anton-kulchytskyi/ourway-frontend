import { getAccessToken } from "@/lib/session";
import { fetchSpaces } from "@/lib/spaces";
import SpacesClient from "@/components/spaces/SpacesClient";
import { redirect } from "next/navigation";

export default async function SpacesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/login`);

  const spaces = await fetchSpaces(token).catch(() => []);

  return (
    <div className="flex flex-col gap-4 h-full">
      <SpacesClient initialSpaces={spaces} token={token} lang={lang} />
    </div>
  );
}
