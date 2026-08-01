export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import InvoiceForm from "@/components/billing/InvoiceForm";
import PageIntro from "@/components/dashboard/PageIntro";
import { requireUser } from "@/lib/auth";

const appointmentSelect = {
  id: true,
  appointmentDate: true,
  appointmentTime: true,
  treatment: true,
  status: true,
};

export default async function NewInvoicePage() {
  const user = await requireUser();
  const [patients, plans] = await Promise.all([
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
    prisma.treatmentPlan.findMany({
      select: { id: true, title: true, patientId: true, visitDate: true },
      where: { status: { not: "Cancelled" }, patient: { clinicId: user.clinicId } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro eyebrow="Billing" title="New invoice" description="Create a bill against the patient’s completed appointment date." />
      <InvoiceForm patients={patients} plans={plans} />
    </div>
  );
}
