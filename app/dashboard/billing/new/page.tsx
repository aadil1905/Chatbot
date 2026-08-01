export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import InvoiceForm from "@/components/billing/InvoiceForm";

const appointmentSelect = {
  id: true,
  appointmentDate: true,
  appointmentTime: true,
  treatment: true,
  status: true,
};

export default async function NewInvoicePage() {
  const [patients, plans] = await Promise.all([
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
    prisma.treatmentPlan.findMany({
      select: { id: true, title: true, patientId: true, visitDate: true },
      where: { status: { not: "Cancelled" } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Billing</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">New invoice</h1>
        <p className="mt-1 text-muted-foreground">Create a bill against the patient’s completed appointment date.</p>
      </div>
      <InvoiceForm patients={patients} plans={plans} />
    </div>
  );
}
