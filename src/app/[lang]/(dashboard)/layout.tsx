import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/actions/auth";

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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-amber-200 bg-amber-50/90 backdrop-blur dark:border-amber-900 dark:bg-stone-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-bold text-amber-600 dark:text-amber-400">OurWay</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{user.name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-amber-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
