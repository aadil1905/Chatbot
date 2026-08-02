export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import PrescriptionForm from "@/components/clinical/PrescriptionForm";
import PageIntro from "@/components/dashboard/PageIntro";

const appointmentSelect = {
  id: true,
  appointmentDate: true,
  appointmentTime: true,
  treatment: true,
  status: true,
};

export default async function NewPrescriptionPage({ searchParams }: { searchParams: Promise<{ patientId?: string; visit?: string }> }) {
  const user = await requireUser();
  const { patientId, visit } = await searchParams;
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
      <PageIntro eyebrow="Prescriptions" title="New prescription" description="Save medicines against the patient’s completed appointment date." />
      <PrescriptionForm patients={patients} initialPatientId={patientId ? Number(patientId) : undefined} initialVisit={visit} />
    </div>
  );
}
