export const dynamic = "force-dynamic";

import { BarChart3, CalendarCheck2, CircleDollarSign, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<string, string> = { Confirmed: "bg-emerald-500", Completed: "bg-blue-500", Pending: "bg-amber-400", Cancelled: "bg-rose-500" };
const currency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default async function ReportsPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [patients, appointments, invoices, payments, statusGroups, treatmentGroups] = await Promise.all([
    prisma.patient.count(), prisma.appointment.findMany({ select: { status: true, appointmentDate: true } }), prisma.invoice.findMany({ select: { totalAmount: true } }), prisma.payment.findMany({ select: { amount: true, paidAt: true } }), prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }), prisma.appointment.groupBy({ by: ["treatment"], _count: { _all: true }, orderBy: { _count: { treatment: "desc" } }, take: 5 }),
  ]);
  const totalAppointments = appointments.length;
  const completed = appointments.filter((item) => item.status === "Completed").length;
  const thisMonthAppointments = appointments.filter((item) => item.appointmentDate >= monthStart).length;
  const invoiced = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const thisMonthCollected = payments.filter((payment) => payment.paidAt >= monthStart).reduce((sum, payment) => sum + payment.amount, 0);
  const completionRate = totalAppointments ? Math.round((completed / totalAppointments) * 100) : 0;
  const largestStatus = Math.max(1, ...statusGroups.map((group) => group._count._all));
  const largestTreatment = Math.max(1, ...treatmentGroups.map((group) => group._count._all));
  const cards = [
    { label: "Total patients", value: patients.toString(), help: "Registered clinic profiles", icon: Users, tone: "bg-cyan-50 text-cyan-700" },
    { label: "Appointments this month", value: thisMonthAppointments.toString(), help: `${totalAppointments} total appointments`, icon: CalendarCheck2, tone: "bg-blue-50 text-blue-700" },
    { label: "Completion rate", value: `${completionRate}%`, help: `${completed} completed appointments`, icon: BarChart3, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Collected this month", value: currency(thisMonthCollected), help: `${currency(collected)} collected overall`, icon: CircleDollarSign, tone: "bg-violet-50 text-violet-700" },
  ];
  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Clinic performance</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Analytics & reports</h1><p className="mt-2 text-muted-foreground">A clear view of appointment activity, patient growth, and collections.</p></div><p className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">Updated {now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, help, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight">{value}</p></div><div className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></div></div><p className="mt-4 text-xs text-muted-foreground">{help}</p></article>)}</section>
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-2xl border border-border bg-card p-6 shadow-sm"><h2 className="text-lg font-bold">Appointment status</h2><p className="mt-1 text-sm text-muted-foreground">Current distribution across all appointments.</p><div className="mt-6 space-y-4">{statusGroups.length === 0 ? <p className="text-sm text-muted-foreground">No appointments yet.</p> : statusGroups.map((group) => <div key={group.status}><div className="flex justify-between text-sm"><span className="font-medium">{group.status}</span><span className="text-muted-foreground">{group._count._all}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${statusStyles[group.status] ?? "bg-slate-500"}`} style={{ width: `${(group._count._all / largestStatus) * 100}%` }} /></div></div>)}</div></article>
      <article className="rounded-2xl border border-border bg-card p-6 shadow-sm"><h2 className="text-lg font-bold">Treatment demand</h2><p className="mt-1 text-sm text-muted-foreground">Most frequently booked treatments.</p><div className="mt-6 space-y-4">{treatmentGroups.length === 0 ? <p className="text-sm text-muted-foreground">No treatment data yet.</p> : treatmentGroups.map((group) => <div key={group.treatment}><div className="flex justify-between gap-4 text-sm"><span className="truncate font-medium">{group.treatment}</span><span className="shrink-0 text-muted-foreground">{group._count._all} bookings</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(group._count._all / largestTreatment) * 100}%` }} /></div></div>)}</div></article>
    </section>
    <section className="grid gap-4 sm:grid-cols-3"><article className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm font-medium text-muted-foreground">Total invoiced</p><p className="mt-2 text-2xl font-bold">{currency(invoiced)}</p></article><article className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm font-medium text-muted-foreground">Total collected</p><p className="mt-2 text-2xl font-bold text-emerald-700">{currency(collected)}</p></article><article className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm font-medium text-muted-foreground">Outstanding</p><p className="mt-2 text-2xl font-bold text-amber-700">{currency(Math.max(0, invoiced - collected))}</p></article></section>
  </div>;
}
