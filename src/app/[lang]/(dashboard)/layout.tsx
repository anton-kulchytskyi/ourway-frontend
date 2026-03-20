import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/actions/auth";
import BottomNav from "@/components/nav/BottomNav";
import Sidebar from "@/components/nav/Sidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const user = await getSession();

  if (!user) redirect(`/${lang}/login`);

  const logout = logoutAction.bind(null, lang);

  return (
    <div className="flex min-h-screen">
      <Sidebar lang={lang} userName={user.name} userRole={user.role} logoutAction={logout} />

      <div className="flex flex-1 flex-col md:ml-56">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 flex h-14 items-center border-b border-amber-200 bg-amber-50/95 px-4 backdrop-blur md:hidden dark:border-amber-900 dark:bg-stone-950/95">
          <span className="font-bold text-amber-600 dark:text-amber-400">OurWay</span>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      <BottomNav lang={lang} userRole={user.role} />
    </div>
  );
}
