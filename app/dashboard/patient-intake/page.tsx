import Link from "next/link";
import { ClipboardPenLine, FileHeart } from "lucide-react";
import PatientIntakeWizard from "@/components/patients/PatientIntakeWizard";

export const dynamic = "force-dynamic";

const intakeSteps = [
  {
    title: "Send secure link",
    description: "Enter the patient details and send a private 48-hour intake link on WhatsApp.",
    icon: ClipboardPenLine,
  },
  {
    title: "Patient completes form",
    description: "The patient selects allergies and medical history, accepts the terms, and signs on their phone.",
    icon: FileHeart,
  },
];

export default async function PatientIntakePage({ searchParams }: { searchParams: Promise<{ name?: string; phone?: string }> }) {
  const { name = "", phone = "" } = await searchParams;
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
              Paperless reception
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Patient intake
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Register a patient and collect their essential medical information before the consultation.
              Everything is saved directly to the patient profile.
            </p>
          </div>
          <Link
            href="/dashboard/patients"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            View patient records
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {intakeSteps.map(({ title, description, icon: Icon }, index) => (
          <article key={title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
                  Step {index + 1}
                </p>
                <h2 className="mt-1 font-bold text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <PatientIntakeWizard defaultName={name} defaultPhone={phone} />
    </div>
  );
}
