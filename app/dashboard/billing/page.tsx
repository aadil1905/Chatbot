export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import DeleteSubmitButton from "@/components/dashboard/DeleteSubmitButton";
import { deleteInvoiceAction } from "@/app/dashboard/delete-actions";
import { requireUser } from "@/lib/auth";

function label(status: string) {
  return status === "Paid"
    ? "bg-emerald-100 text-emerald-800"
    : status === "Partially Paid"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-700";
}

export default async function BillingPage() {
  const user = await requireUser();
  const invoices = await prisma.invoice.findMany({
    where: { patient: { clinicId: user.clinicId } },
    include: { patient: true, payments: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const totals = invoices.reduce(
    (result, invoice) => {
      const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
      result.billed += invoice.totalAmount;
      result.collected += paid;
      return result;
    },
    { billed: 0, collected: 0 },
  );

  return (
    <div className="dashboard-list-page mx-auto max-w-7xl space-y-6">
      <header className="dashboard-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="mt-1 text-muted-foreground">Create invoices and track patient payments.</p>
        </div>
        <Link href="/dashboard/billing/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          <Plus className="size-4" /> New invoice
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Invoiced</p><p className="mt-1 text-2xl font-bold">₹{totals.billed.toLocaleString("en-IN")}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Collected</p><p className="mt-1 text-2xl font-bold text-emerald-700">₹{totals.collected.toLocaleString("en-IN")}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Outstanding</p><p className="mt-1 text-2xl font-bold text-amber-700">₹{(totals.billed - totals.collected).toLocaleString("en-IN")}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">No invoices yet. Create your first invoice to start tracking payments.</div>
          ) : (
            <div className="divide-y">
              {invoices.map((invoice) => {
                const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
                return (
                  <article key={invoice.id} className="flex flex-col gap-3 p-5 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={`/dashboard/billing/${invoice.id}`} className="min-w-0 flex-1">
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{invoice.patient.fullName} · {invoice.issueDate.toLocaleDateString()}</p>
                    </Link>
                    <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end sm:text-right">
                      <div>
                        <p className="font-semibold">₹{invoice.totalAmount.toLocaleString("en-IN")}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Paid ₹{paid.toLocaleString("en-IN")}</p>
                        <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${label(invoice.status)}`}>{invoice.status}</span>
                      </div>
                      <form action={deleteInvoiceAction}>
                        <input type="hidden" name="id" value={invoice.id} />
                        <DeleteSubmitButton confirmMessage={`Delete invoice ${invoice.invoiceNumber}?`} />
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
