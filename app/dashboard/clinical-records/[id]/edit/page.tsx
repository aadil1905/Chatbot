export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import ClinicalRecordForm from "@/components/clinical/ClinicalRecordForm";
import PageIntro from "@/components/dashboard/PageIntro";

export default async function EditClinicalRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = Number((await params).id);
  const record = await prisma.clinicalRecord.findFirst({ where: { id, patient: { clinicId: user.clinicId } } });
  if (!record) notFound();
  const patients = await prisma.patient.findMany({
    where: { clinicId: user.clinicId },
    select: {
      id: true,
      fullName: true,
      phone: true,
      appointments: {
        where: { status: "Completed" },
        select: { id: true, appointmentDate: true, appointmentTime: true, treatment: true, status: true },
        orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "desc" }],
      },
    },
    orderBy: { fullName: "asc" },
  });
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro
        eyebrow="Clinical records"
        title="Edit case paper"
        description="Update this existing record without creating a duplicate."
      />
      <ClinicalRecordForm patients={patients} selectedPatientId={record.patientId} editingRecord={record} />
    </div>
  );
}
