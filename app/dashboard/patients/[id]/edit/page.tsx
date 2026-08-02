import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import PatientForm from "@/components/patients/PatientForm";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const patient = await prisma.patient.findFirst({
    where: { id: Number(id), clinicId: user.clinicId },
  });
  if (!patient) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit patient</h1>
        <p className="mt-1 text-muted-foreground">
          Update {patient.fullName}&apos;s patient details.
        </p>
      </div>
      <PatientForm mode="edit" patient={{ ...patient, dateOfBirth: patient.dateOfBirth?.toISOString() ?? null }} />
    </div>
  );
}
