import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-amber-500">404</p>
      <h1 className="mt-4 text-xl font-bold text-stone-800 dark:text-stone-100">Page not found</h1>
      <p className="mt-2 text-sm text-stone-400">This page doesn&apos;t exist or was moved.</p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
