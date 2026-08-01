import type { ReactNode } from "react";

export default function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: ReactNode }) {
  return <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-1 text-muted-foreground">{description}</p></div>;
}
