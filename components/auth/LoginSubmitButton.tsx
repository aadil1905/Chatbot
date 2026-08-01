"use client";

import { useFormStatus } from "react-dom";

export default function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="login-submit-button h-11 w-full rounded-xl bg-sky-700 font-semibold text-white shadow-lg shadow-sky-900/10 transition hover:bg-sky-800 disabled:pointer-events-none disabled:opacity-80"
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="login-submit-spinner" />
          Signing in...
        </span>
      ) : (
        "Sign in"
      )}
    </button>
  );
}
