export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import ClinicalRecordForm from "@/components/clinical/ClinicalRecordForm";
import PageIntro from "@/components/dashboard/PageIntro";

type Props = { searchParams: Promise<{ patientId?: string }> };

const appointmentSelect = {
  id: true,
  appointmentDate: true,
  appointmentTime: true,
  treatment: true,
  status: true,
};

export default async function NewClinicalRecordPage({ searchParams }: Props) {
  const user = await requireUser();
  const { patientId } = await searchParams;
  const selectedPatientId = Number(patientId);
  const patients = await prisma.patient.findMany({
    where: { clinicId: user.clinicId },
    select: {
      id: true,
      fullName: true,
      phone: true,
      appointments: {
        where: { status: "Completed" },
        select: appointmentSelect,
        orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "desc" }],
      },
    },
    orderBy: { fullName: "asc" },
  });
  const selectedPatient = Number.isInteger(selectedPatientId)
    ? patients.find((patient) => patient.id === selectedPatientId)
    : undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro
        eyebrow="Clinical records"
        title={selectedPatient ? "Continue medical history" : "New clinical record"}
        description={selectedPatient
          ? `Add visit notes to ${selectedPatient.fullName}'s completed appointment date.`
          : "Document a completed patient visit and clinical findings."}
      />
      <ClinicalRecordForm patients={patients} selectedPatientId={selectedPatient?.id} />
    </div>
  );
}
