import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-background p-6"><section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700"><FileQuestion className="size-6" /></div><p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-primary">404</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">The link may be incorrect, or the page may have moved. Return to your DentalAI workspace to continue.</p><Link href="/dashboard" className="mt-7 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"><ArrowLeft className="size-4" />Return to dashboard</Link></section></main>;
}
