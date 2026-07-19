export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import InvoiceForm from "@/components/billing/InvoiceForm";

export default async function NewInvoicePage() {
  const [patients, plans] = await Promise.all([prisma.patient.findMany({ select: { id: true, fullName: true, phone: true }, orderBy: { fullName: "asc" } }), prisma.treatmentPlan.findMany({ select: { id: true, title: true, patientId: true }, where: { status: { not: "Cancelled" } }, orderBy: { updatedAt: "desc" } })]);
  return <div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-3xl font-bold">New invoice</h1><p className="mt-1 text-muted-foreground">Create a bill for a patient or treatment plan.</p></div><InvoiceForm patients={patients} plans={plans} /></div>;
}
