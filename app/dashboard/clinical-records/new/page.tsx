export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ClinicalRecordForm from "@/components/clinical/ClinicalRecordForm";
export default async function NewClinicalRecordPage() { const patients = await prisma.patient.findMany({ select: { id: true, fullName: true, phone: true }, orderBy: { fullName: "asc" } }); return <div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-3xl font-bold">New clinical record</h1><p className="mt-1 text-muted-foreground">Document a patient visit and clinical findings.</p></div><ClinicalRecordForm patients={patients} /></div>; }
