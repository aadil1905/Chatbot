import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  descriptionMarginClassName?: "mt-1" | "mt-2";
};

export default function PageIntro({
  eyebrow,
  title,
  description,
  descriptionMarginClassName = "mt-1",
}: PageIntroProps) {
  return <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className={`${descriptionMarginClassName} text-muted-foreground`}>{description}</p></div>;
}
