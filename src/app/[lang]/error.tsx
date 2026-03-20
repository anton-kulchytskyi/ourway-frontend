"use client";

import { useEffect } from "react";

export default function Error({
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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-red-400">500</p>
      <h1 className="mt-4 text-xl font-bold text-stone-800 dark:text-stone-100">Something went wrong</h1>
      <p className="mt-2 text-sm text-stone-400">An unexpected error occurred. Try again or go back home.</p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
