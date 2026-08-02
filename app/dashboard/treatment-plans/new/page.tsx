export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import TreatmentPlanForm from "@/components/clinical/TreatmentPlanForm";
import PageIntro from "@/components/dashboard/PageIntro";

const appointmentSelect = {
  id: true,
  appointmentDate: true,
  appointmentTime: true,
  treatment: true,
  status: true,
};

export default async function NewTreatmentPlanPage({ searchParams }: { searchParams: Promise<{ patientId?: string; visitDate?: string }> }) {
  const user = await requireUser();
  const { patientId, visitDate } = await searchParams;
  const [patients, services] = await Promise.all([
    prisma.patient.findMany({
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
    }),
    prisma.clinicService.findMany({
      where: { clinicId: user.clinicId },
      select: { id: true, name: true, price: true, active: true },
      orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro eyebrow="Treatment planning" title="New treatment plan" description="Attach the plan and cost to a completed appointment date." />
      <TreatmentPlanForm patients={patients} services={services} initialPatientId={patientId || ""} initialVisit={visitDate} />
    </div>
  );
}
