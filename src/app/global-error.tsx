"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-stone-50 text-stone-900">
        <p className="text-6xl font-bold text-red-400">500</p>
        <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-stone-400">An unexpected error occurred.</p>
        <button
          onClick={reset}
          className="mt-8 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
