import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import TreatmentPlanForm from "@/components/clinical/TreatmentPlanForm";
import PageIntro from "@/components/dashboard/PageIntro";

export default async function EditTreatmentPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(); const id = Number((await params).id);
  const [plan, patients, services] = await Promise.all([prisma.treatmentPlan.findFirst({ where: { id, patient: { clinicId: user.clinicId } }, include: { selectedTeeth: true, items: true } }), prisma.patient.findMany({ where: { clinicId: user.clinicId }, select: { id: true, fullName: true, phone: true, appointments: { where: { status: "Completed" }, select: { id: true, appointmentDate: true, appointmentTime: true, treatment: true, status: true }, orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "desc" }] } }, orderBy: { fullName: "asc" } }), prisma.clinicService.findMany({ where: { clinicId: user.clinicId }, select: { id: true, name: true, price: true, active: true }, orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { name: "asc" }] })]);
  if (!plan) notFound();
  return <div className="mx-auto max-w-5xl space-y-6"><PageIntro eyebrow="Treatment planning" title="Continue treatment plan" description="Update this plan without creating a duplicate." /><TreatmentPlanForm patients={patients} services={services} editingPlan={plan} /></div>;
}
