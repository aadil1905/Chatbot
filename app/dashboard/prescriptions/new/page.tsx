export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import PrescriptionForm from "@/components/clinical/PrescriptionForm";

export default async function NewPrescriptionPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const [{ patientId }, patients] = await Promise.all([searchParams, prisma.patient.findMany({ select: { id: true, fullName: true, phone: true }, orderBy: { fullName: "asc" } })]);
  return <div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-3xl font-bold">New prescription</h1><p className="mt-1 text-muted-foreground">Save medicines and patient instructions in the permanent patient history.</p></div><PrescriptionForm patients={patients} initialPatientId={patientId ? Number(patientId) : undefined} /></div>;
}
