import Link from "next/link";
import {
  AlertTriangle,
  CalendarX2,
  IndianRupee,
  PackageSearch,
  ReceiptIndianRupee,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const currency = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const percentage = (numerator: number, denominator: number) =>
  denominator ? Math.round((numerator / denominator) * 100) : 0;

function startOfDay(input = new Date()) {
  const value = new Date(input);
  value.setHours(0, 0, 0, 0);
  return value;
}

export default async function AnalyticsPage() {
  const user = await requirePermission("manageBilling");
  const today = startOfDay();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    yesterdayPayments,
    monthPayments,
    openInvoices,
    missedAppointments,
    newPatients,
    convertedLeads,
    totalLeads,
    lowStock,
    treatmentPlans,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { invoice: { patient: { clinicId: user.clinicId } }, paidAt: { gte: yesterday, lt: today } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { invoice: { patient: { clinicId: user.clinicId } }, paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.invoice.findMany({
      where: { patient: { clinicId: user.clinicId } },
      select: { id: true, totalAmount: true, payments: { select: { amount: true } } },
    }),
    prisma.appointment.count({
      where: {
        clinicId: user.clinicId,
        appointmentDate: { lt: today },
        status: { in: ["Pending", "Cancelled"] },
      },
    }),
    prisma.patient.count({ where: { clinicId: user.clinicId, createdAt: { gte: monthStart } } }),
    prisma.lead.count({ where: { clinicId: user.clinicId, stage: "CONVERTED" } }),
    prisma.lead.count({ where: { clinicId: user.clinicId } }),
    prisma.inventoryItem.count({ where: { clinicId: user.clinicId, active: true, quantity: { lte: prisma.inventoryItem.fields.reorderLevel } } }),
    prisma.treatmentPlan.groupBy({
      by: ["title"],
      where: { patient: { clinicId: user.clinicId }, createdAt: { gte: monthStart } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ]);

  const conversionRate = percentage(convertedLeads, totalLeads);
  const pendingInvoiceCount = openInvoices.filter((invoice) => invoice.payments.reduce((total, payment) => total + payment.amount, 0) < invoice.totalAmount).length;
  const outstandingRevenue = openInvoices.reduce((total, invoice) => total + invoice.totalAmount - invoice.payments.reduce((paid, payment) => paid + payment.amount, 0), 0);

  const cards = [
    {
      label: "Yesterday's revenue",
      value: currency(yesterdayPayments._sum.amount ?? 0),
      help: "Payments received yesterday",
      icon: IndianRupee,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending payments",
      value: currency(outstandingRevenue),
      help: `${pendingInvoiceCount} invoice balance(s) to collect`,
      icon: ReceiptIndianRupee,
      tone: "bg-amber-50 text-amber-800",
    },
    {
      label: "Missed appointments",
      value: missedAppointments.toString(),
      help: "Past pending or cancelled bookings",
      icon: CalendarX2,
      tone: "bg-rose-50 text-rose-700",
    },
    {
      label: "New patients",
      value: newPatients.toString(),
      help: "Added this month",
      icon: UserPlus,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "Lead conversion",
      value: `${conversionRate}%`,
      help: `${convertedLeads} of ${totalLeads} enquiries converted`,
      icon: TrendingUp,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Inventory alerts",
      value: lowStock.toString(),
      help: "Items at or below reorder level",
      icon: PackageSearch,
      tone: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6 shadow-sm sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">
            One-click revenue dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Analytics
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            A live morning view of collections, outstanding revenue, patient growth,
            conversion performance, missed appointments, and stock risks.
          </p>
        </div>
        <div className="rounded-2xl border border-white bg-white/80 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Collections this month
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-950">
            {currency(monthPayments._sum.amount ?? 0)}
          </p>
          <Link href="/dashboard/exports" className="mt-3 inline-flex text-sm font-bold text-primary hover:underline">Export report data</Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, help, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
              </div>
              <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone}`}>
                <Icon className="size-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{help}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold">Top procedures this month</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked using treatment plans created during the current month.
          </p>
          <div className="mt-5 space-y-3">
            {treatmentPlans.length ? (
              treatmentPlans.map((procedure, index) => (
                <div key={procedure.title} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-semibold">
                    {index + 1}. {procedure.title}
                  </span>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                    {procedure._count.id}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                No treatment plans were created this month.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            <h2 className="text-lg font-bold">Recommended actions</h2>
          </div>
          <div className="mt-5 space-y-3">
            <Link href="/dashboard/billing" className="block rounded-xl border p-4 transition hover:bg-amber-50">
              <p className="font-semibold">Collect pending payments</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Review {pendingInvoiceCount} invoice balance(s) worth {currency(outstandingRevenue)}.
              </p>
            </Link>
            <Link href="/dashboard/appointments" className="block rounded-xl border p-4 transition hover:bg-rose-50">
              <p className="font-semibold">Review missed appointments</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Reconnect with {missedAppointments} past pending or cancelled patient(s).
              </p>
            </Link>
            <Link href="/dashboard/operations" className="block rounded-xl border p-4 transition hover:bg-orange-50">
              <p className="font-semibold">Restock clinical supplies</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {lowStock} active inventory item(s) need attention.
              </p>
            </Link>
          </div>
        </article>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/reports" className="text-sm font-semibold text-primary hover:underline">
          Open detailed conversion reports →
        </Link>
        <Link href="/dashboard/exports" className="text-sm font-semibold text-primary hover:underline">
          Export clinic data →
        </Link>
      </div>
    </div>
  );
}
