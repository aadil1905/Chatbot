"use client";

import { useFormStatus } from "react-dom";

type DeleteSubmitButtonProps = {
  label?: string;
  confirmMessage?: string;
};

export default function DeleteSubmitButton({
  label = "Delete",
  confirmMessage = "Delete this item? This cannot be undone.",
}: DeleteSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:pointer-events-none disabled:opacity-70"
    >
      {pending ? "Deleting..." : label}
    </button>
  );
}
