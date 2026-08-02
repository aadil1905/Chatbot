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

function nextNumber(invoiceNumbers: string[]) {
  const highest = invoiceNumbers.reduce((maximum, invoiceNumber) => Math.max(maximum, Number(invoiceNumber.match(/(\d+)$/)?.[1] || 0)), 0);
  return `DDW-${String(highest + 1).padStart(2, "0")}`;
}

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ patientId?: string; visit?: string; fromPatient?: string }> }) {
  const user = await requireUser();
  const { patientId, visit, fromPatient } = await searchParams;
  const [patients, plans, latestInvoice] = await Promise.all([
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
      select: { id: true, title: true, patientId: true, visitDate: true, items: { select: { name: true, price: true } } },
      where: { status: { not: "Cancelled" }, patient: { clinicId: user.clinicId } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.invoice.findMany({ where: { patient: { clinicId: user.clinicId } }, select: { invoiceNumber: true } }),
  ]);
  const nextInvoiceNumber = nextNumber(latestInvoice.map((invoice) => invoice.invoiceNumber));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro eyebrow="Billing" title="New invoice" description="Create a bill against the patient’s completed appointment date." />
      <InvoiceForm patients={patients} plans={plans} initialPatientId={Number(patientId) || undefined} initialVisit={visit} nextInvoiceNumber={nextInvoiceNumber} fromPatient={fromPatient === "1"} />
    </div>
  );
}
