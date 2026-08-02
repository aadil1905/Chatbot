import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileSignature } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function dateValue(date: Date | null) {
  return date ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not recorded";
}

function parseHistory(value: string | null) {
  if (!value) return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; }
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 whitespace-pre-wrap font-medium text-slate-900">{value || "Not provided"}</p></div>;
}

export default async function CasePaperPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const patient = await prisma.patient.findFirst({
    where: { id: Number(id), clinicId: user.clinicId },
    include: { intakeRequests: { where: { status: { in: ["COMPLETED", "REVIEWED"] }, consentGiven: true, patientSignature: { not: null } }, orderBy: { completedAt: "desc" }, take: 1 } },
  });
  if (!patient) notFound();
  const casePaper = patient.intakeRequests[0];
  if (!casePaper) notFound();
  const medicalHistory = parseHistory(casePaper.medicalHistory);

  return <div className="mx-auto max-w-4xl space-y-6">
    <Link href={`/dashboard/patients/${patient.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="size-4" /> Back to patient</Link>
    <article className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <header className="border-b bg-gradient-to-r from-sky-50 via-white to-emerald-50 px-6 py-7 sm:px-8">
        <div className="flex items-start justify-between gap-5"><div className="flex items-start gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><FileSignature className="size-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Patient case paper</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{patient.fullName}</h1><p className="mt-1 text-sm text-muted-foreground">Completed intake and signed consent</p></div></div><p className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">Signed {dateValue(casePaper.completedAt)}</p></div>
      </header>
      <div className="space-y-8 p-6 sm:p-8">
        <section><h2 className="text-lg font-bold">Patient details</h2><div className="mt-4 grid gap-5 rounded-2xl border bg-slate-50/60 p-5 sm:grid-cols-2 lg:grid-cols-3"><Detail label="Phone" value={patient.phone} /><Detail label="Email" value={patient.email} /><Detail label="Date of birth" value={dateValue(patient.dateOfBirth)} /><Detail label="Gender" value={patient.gender} /><Detail label="Address" value={patient.address} /></div></section>
        <section><h2 className="text-lg font-bold">Medical intake</h2><div className="mt-4 grid gap-5 rounded-2xl border p-5 sm:grid-cols-2"><Detail label="Allergies" value={casePaper.drugAllergies} /><Detail label="Current medications" value={casePaper.medications} /><Detail label="Other medical history" value={casePaper.otherHistory} /><Detail label="Dental history" value={casePaper.dentalHistory} /><Detail label="Weight" value={casePaper.weightKg ? `${casePaper.weightKg} kg` : null} /></div><div className="mt-4"><p className="text-sm font-semibold">Medical history checklist</p>{medicalHistory.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{medicalHistory.map((item) => <span key={item} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">{item}</span>)}</div> : <p className="mt-2 text-sm text-slate-600">No conditions reported.</p>}</div></section>
        <section><h2 className="text-lg font-bold">Treatment notes</h2><div className="mt-4 rounded-2xl border bg-slate-50/60 p-5"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{casePaper.treatmentDone || "Not provided"}</p></div></section>
        <section><h2 className="text-lg font-bold">Clinic consent statement</h2><div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950"><ol className="list-decimal space-y-2 pl-5 leading-6"><li>I authorize the doctor and designated assistants to examine me and perform the agreed dental procedure and anaesthesia where required.</li><li>The procedure, alternatives, expected benefits, and material risks will be explained before treatment.</li><li>I understand medicine and surgery are not exact sciences and no result can be guaranteed.</li><li>I have disclosed relevant illnesses, allergies, medications, pregnancy, and previous treatment truthfully.</li><li>I understand possible complications may include pain, swelling, bleeding, infection, altered sensation, or other procedure-specific risks.</li></ol><p className="mt-5 rounded-xl border border-emerald-200 bg-white/70 p-3 font-semibold">The patient confirmed they read and understood this consent statement and agreed to proceed.</p>{casePaper.consentNotes ? <p className="mt-4 whitespace-pre-wrap"><span className="font-semibold">Patient notes:</span> {casePaper.consentNotes}</p> : null}</div></section>
        <section><h2 className="text-lg font-bold">Digital signatures</h2><div className={`mt-4 grid gap-5 ${casePaper.patientSignature && casePaper.guardianSignature ? "sm:grid-cols-2" : ""}`}>{casePaper.patientSignature ? <Signature label="Patient signature" src={casePaper.patientSignature} /> : null}{casePaper.guardianSignature ? <Signature label="Guardian signature" src={casePaper.guardianSignature} /> : null}</div></section>
      </div>
    </article>
  </div>;
}

function Signature({ label, src }: { label: string; src: string }) {
  return <div className="rounded-2xl border bg-slate-50 p-4"><p className="mb-3 text-sm font-semibold">{label}</p><Image src={src} alt={label} width={600} height={180} unoptimized className="h-auto w-full rounded-xl bg-white" /></div>;
}
