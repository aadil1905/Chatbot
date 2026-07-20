export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronRight, ScanLine } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ClinicalWorkspacePage() {
  await requireUser();
  const patients = await prisma.patient.findMany({ include: { dentalChartEntries: { select: { id: true } }, clinicalRecords: { orderBy: { visitDate: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 100 });
  return <div className="mx-auto max-w-6xl space-y-6"><header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Dentist workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Clinical workspace</h1><p className="mt-2 text-muted-foreground">Open a patient’s dental chart and keep tooth-level findings alongside their visit history.</p></header><section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">{patients.length === 0 ? <div className="px-6 py-16 text-center text-sm text-muted-foreground">Add a patient first to create a clinical chart.</div> : <div className="divide-y divide-border">{patients.map((patient) => <Link key={patient.id} href={`/dashboard/clinical-workspace/${patient.id}`} className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-muted/40"><div className="flex min-w-0 items-center gap-4"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700"><ScanLine className="size-5" /></div><div className="min-w-0"><p className="font-semibold">{patient.fullName}</p><p className="mt-1 text-sm text-muted-foreground">{patient.phone} · {patient.dentalChartEntries.length} charted teeth{patient.clinicalRecords[0] ? ` · Last visit ${patient.clinicalRecords[0].visitDate.toLocaleDateString("en-IN")}` : ""}</p></div></div><ChevronRight className="size-5 shrink-0 text-muted-foreground" /></Link>)}</div>}</section></div>;
}
