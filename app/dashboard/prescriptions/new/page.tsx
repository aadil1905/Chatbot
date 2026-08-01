export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import PrescriptionForm from "@/components/clinical/PrescriptionForm";

const appointmentSelect = {
  id: true,
  appointmentDate: true,
  appointmentTime: true,
  treatment: true,
  status: true,
};

export default async function NewPrescriptionPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const user = await requireUser();
  const { patientId } = await searchParams;
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Prescriptions</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">New prescription</h1>
        <p className="mt-1 text-muted-foreground">Save medicines against the patient’s completed appointment date.</p>
      </div>
      <PrescriptionForm patients={patients} initialPatientId={patientId ? Number(patientId) : undefined} />
    </div>
  );
}
