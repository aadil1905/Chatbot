export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import TreatmentPlanForm from "@/components/clinical/TreatmentPlanForm";
export default async function NewTreatmentPlanPage() { const [patients, services] = await Promise.all([prisma.patient.findMany({ select: { id: true, fullName: true, phone: true }, orderBy: { fullName: "asc" } }), prisma.clinicService.findMany({ select: { id: true, name: true, price: true, active: true }, orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { name: "asc" }] })]); return <div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-3xl font-bold">New treatment plan</h1><p className="mt-1 text-muted-foreground">Choose a saved clinic service, tooth number, and patient-specific price.</p></div><TreatmentPlanForm patients={patients} services={services} /></div>; }
