import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-stone-50 text-stone-900">
        <p className="text-6xl font-bold text-amber-500">404</p>
        <h1 className="mt-4 text-xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-stone-400">This page doesn&apos;t exist or was moved.</p>
        <Link
          href="/en"
          className="mt-8 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
        >
          Go home
        </Link>
      </body>
    </html>
  );
}
