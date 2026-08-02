import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import PrescriptionForm from "@/components/clinical/PrescriptionForm";
import PageIntro from "@/components/dashboard/PageIntro";

export default async function EditPrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(); const id = Number((await params).id);
  const [prescription, patients] = await Promise.all([prisma.prescription.findFirst({ where: { id, patient: { clinicId: user.clinicId } } }), prisma.patient.findMany({ where: { clinicId: user.clinicId }, select: { id: true, fullName: true, phone: true, appointments: { where: { status: "Completed" }, select: { id: true, appointmentDate: true, appointmentTime: true, treatment: true, status: true }, orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "desc" }] } }, orderBy: { fullName: "asc" } })]);
  if (!prescription) notFound();
  return <div className="mx-auto max-w-5xl space-y-6"><PageIntro eyebrow="Prescriptions" title="Continue prescription" description="Update the saved prescription without creating a duplicate." /><PrescriptionForm patients={patients} editingPrescription={prescription} /></div>;
}
