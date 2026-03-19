async function getBackendStatus() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      cache: "no-store",
    });
    const data = await res.json();
    return { ok: true, data };
  } catch {
    return { ok: false, data: null };
  }
}

export default async function Home() {
  const { ok, data } = await getBackendStatus();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          OurWay
        </h1>
        <div className="flex items-center justify-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-zinc-600 dark:text-zinc-400">
            Backend:{" "}
            <span className={ok ? "text-green-600" : "text-red-500"}>
              {ok ? data?.status : "недоступний"}
            </span>
          </span>
        </div>
        <p className="mt-4 text-sm text-zinc-400">
          {process.env.NEXT_PUBLIC_API_URL}
        </p>
      </div>
    </div>
  );
}
