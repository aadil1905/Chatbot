export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import TreatmentPlanForm from "@/components/clinical/TreatmentPlanForm";
export default async function NewTreatmentPlanPage() { const patients = await prisma.patient.findMany({ select: { id: true, fullName: true, phone: true }, orderBy: { fullName: "asc" } }); return <div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-3xl font-bold">New treatment plan</h1><p className="mt-1 text-muted-foreground">Create a proposed or active care plan for a patient.</p></div><TreatmentPlanForm patients={patients} /></div>; }
