export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ClinicalRecordForm from "@/components/clinical/ClinicalRecordForm";

type Props = { searchParams: Promise<{ patientId?: string }> };

const appointmentSelect = {
  id: true,
  appointmentDate: true,
  appointmentTime: true,
  treatment: true,
  status: true,
};

export default async function NewClinicalRecordPage({ searchParams }: Props) {
  const { patientId } = await searchParams;
  const selectedPatientId = Number(patientId);
  const patients = await prisma.patient.findMany({
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
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Clinical records</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{selectedPatient ? "Continue medical history" : "New clinical record"}</h1>
        <p className="mt-1 text-muted-foreground">
          {selectedPatient
            ? `Add visit notes to ${selectedPatient.fullName}'s completed appointment date.`
            : "Document a completed patient visit and clinical findings."}
        </p>
      </div>
      <ClinicalRecordForm patients={patients} selectedPatientId={selectedPatient?.id} />
    </div>
  );
}
