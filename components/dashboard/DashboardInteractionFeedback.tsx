"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function DashboardInteractionFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState("Opening");

  useEffect(() => {
    const finishId = window.setTimeout(() => setBusy(false), 80);
    document.querySelectorAll("[data-navigation-pending='true']").forEach((element) => {
      delete (element as HTMLElement).dataset.navigationPending;
    });
    return () => window.clearTimeout(finishId);
  }, [pathname, searchParams]);

  useEffect(() => {
    let timeoutId: number | undefined;

    const start = (nextLabel: string, fallbackMs: number) => {
      if (timeoutId) window.clearTimeout(timeoutId);
      setLabel(nextLabel);
      setBusy(true);
      timeoutId = window.setTimeout(() => setBusy(false), fallbackMs);
    };

    const handleClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      anchor.dataset.navigationPending = "true";
      start("Opening", 3500);
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      const submitter = event.submitter as HTMLElement | null;
      if (!form) return;

      form.dataset.pending = "true";
      if (submitter) submitter.dataset.pending = "true";
      start("Saving", 4500);

      window.setTimeout(() => {
        delete form.dataset.pending;
        if (submitter) delete submitter.dataset.pending;
      }, 4500);
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className={`dashboard-progress ${busy ? "dashboard-progress-visible" : ""}`}
      />
      <div
        aria-live="polite"
        aria-atomic="true"
        className={`dashboard-loading-pill ${busy ? "dashboard-loading-pill-visible" : ""}`}
      >
        <span className="dashboard-loading-spinner" aria-hidden="true" />
        {label}...
      </div>
    </>
  );
}
