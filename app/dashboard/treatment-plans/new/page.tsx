export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import TreatmentPlanForm from "@/components/clinical/TreatmentPlanForm";

const appointmentSelect = {
  id: true,
  appointmentDate: true,
  appointmentTime: true,
  treatment: true,
  status: true,
};

export default async function NewTreatmentPlanPage() {
  const [patients, services] = await Promise.all([
    prisma.patient.findMany({
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
      select: { id: true, name: true, price: true, active: true },
      orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Treatment planning</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">New treatment plan</h1>
        <p className="mt-1 text-muted-foreground">Attach the plan and cost to a completed appointment date.</p>
      </div>
      <TreatmentPlanForm patients={patients} services={services} />
    </div>
  );
}
