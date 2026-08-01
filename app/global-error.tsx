"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-slate-50 p-6 font-sans text-slate-900">
        <main className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">DentalAI</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">This screen needs another try</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The page could not load. Your saved clinic data has not been changed.
          </p>
          <button
            type="button"
            onClick={unstable_retry}
            className="mt-6 inline-flex h-10 items-center rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
