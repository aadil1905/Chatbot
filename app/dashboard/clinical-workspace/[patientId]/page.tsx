export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { notFound } from "next/navigation";
import DentalChartEditor from "@/components/clinical/DentalChartEditor";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PatientClinicalWorkspace({ params }: { params: Promise<{ patientId: string }> }) {
  await requireUser();
  const { patientId } = await params;
  const id = Number(patientId);
  const patient = await prisma.patient.findUnique({ where: { id }, include: { dentalChartEntries: { orderBy: { toothNumber: "asc" } }, clinicalRecords: { orderBy: { visitDate: "desc" }, take: 8 } } });
  if (!patient) notFound();
  return <div className="mx-auto max-w-7xl space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/dashboard/clinical-workspace" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="size-4" />Clinical workspace</Link><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{patient.fullName}</h1><p className="mt-2 text-muted-foreground">{patient.phone} · Tooth chart and clinical history</p></div><Link href={`/dashboard/patients/${patient.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:bg-muted"><ClipboardList className="size-4" />Open patient profile</Link></header><DentalChartEditor patientId={patient.id} entries={patient.dentalChartEntries} /><section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><h2 className="text-lg font-bold">Recent clinical records</h2>{patient.clinicalRecords.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No clinical records have been added yet.</p> : <div className="mt-5 divide-y divide-border">{patient.clinicalRecords.map((record) => <article key={record.id} className="py-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{record.chiefComplaint}</p><p className="text-sm text-muted-foreground">{record.visitDate.toLocaleDateString("en-IN")}</p></div><p className="mt-2 text-sm text-muted-foreground">{record.diagnosis || "No diagnosis recorded"}</p>{record.clinicalNotes && <p className="mt-2 whitespace-pre-wrap text-sm">{record.clinicalNotes}</p>}</article>)}</div>}</section></div>;
}
