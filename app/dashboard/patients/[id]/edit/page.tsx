import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PatientForm from "@/components/patients/PatientForm";
import PatientMedicalEditForm from "@/components/patients/PatientMedicalEditForm";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id: Number(id) },
    include: { clinicalRecords: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!patient) notFound();
  const latestRecord = patient.clinicalRecords[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit patient</h1>
        <p className="mt-1 text-muted-foreground">
          Update {patient.fullName}&apos;s personal, medical, dental, treatment, and consent information.
        </p>
      </div>
      <PatientForm mode="edit" patient={{ ...patient, dateOfBirth: patient.dateOfBirth?.toISOString() ?? null }} />
      <PatientMedicalEditForm
        patientId={patient.id}
        record={latestRecord ? {
          id: latestRecord.id,
          chiefComplaint: latestRecord.chiefComplaint,
          diagnosis: latestRecord.diagnosis,
          clinicalNotes: latestRecord.clinicalNotes,
          medicalHistory: latestRecord.medicalHistory,
          drugAllergies: latestRecord.drugAllergies,
          medications: latestRecord.medications,
          otherHistory: latestRecord.otherHistory,
          bloodPressure: latestRecord.bloodPressure,
          weightKg: latestRecord.weightKg,
          dentalHistory: latestRecord.dentalHistory,
          treatmentDone: latestRecord.treatmentDone,
          estimateAmount: latestRecord.estimateAmount,
          consentGiven: latestRecord.consentGiven,
          consentNotes: latestRecord.consentNotes,
        } : null}
      />
    </div>
  );
}
