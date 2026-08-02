import Link from "next/link";
import { AlertTriangle, CalendarCheck2, CircleDollarSign, ClipboardCheck, UserRoundX } from "lucide-react";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default async function DailyHuddlePage() {
  const user = await requirePermission("manageSchedule");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [todayAppointments, overdueTasks, unpaid, proposedPlans, lowStock] = await Promise.all([
    prisma.appointment.findMany({ where: { clinicId: user.clinicId, archivedAt: null, appointmentDate: { gte: today, lt: tomorrow } }, include: { provider: true, chair: true }, orderBy: { appointmentTime: "asc" } }),
    prisma.followUpTask.count({ where: { clinicId: user.clinicId, status: "PENDING", scheduledFor: { lte: new Date() } } }),
    prisma.invoice.findMany({ where: { patient: { clinicId: user.clinicId }, status: { not: "Paid" } }, include: { payments: true }, take: 100 }),
    prisma.treatmentPlan.count({ where: { patient: { clinicId: user.clinicId }, status: "Proposed" } }),
    prisma.inventoryItem.count({ where: { clinicId: user.clinicId, active: true, quantity: { lte: 0 } } }),
  ]);
  const outstanding = unpaid.reduce((total, invoice) => total + Math.max(0, invoice.totalAmount - invoice.payments.reduce((paid, payment) => paid + payment.amount, 0)), 0);
  const pending = todayAppointments.filter((item) => item.status === "Pending").length;
  const confirmed = todayAppointments.filter((item) => item.status === "Confirmed").length;
  const cards = [
    { label: "Today's bookings", value: todayAppointments.length, help: `${confirmed} confirmed · ${pending} need confirmation`, icon: CalendarCheck2, href: "/dashboard/appointments?status=Pending", tone: "bg-sky-50 text-sky-700" },
    { label: "Overdue outreach", value: overdueTasks, help: "Patients or enquiries awaiting a response", icon: UserRoundX, href: "/dashboard/follow-ups", tone: "bg-amber-50 text-amber-800" },
    { label: "Outstanding balance", value: money(outstanding), help: `${unpaid.length} invoice(s) require recovery`, icon: CircleDollarSign, href: "/dashboard/billing", tone: "bg-rose-50 text-rose-700" },
    { label: "Proposed care", value: proposedPlans, help: "Plans waiting for an acceptance decision", icon: ClipboardCheck, href: "/dashboard/treatment-plans", tone: "bg-violet-50 text-violet-700" },
  ];
  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Morning control room</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Daily huddle</h1><p className="mt-2 max-w-2xl text-muted-foreground">A five-minute owner and front-desk check before the first patient: fill the diary, protect collections, and prevent missed follow-up.</p></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, help, icon: Icon, href, tone }) => <Link key={label} href={href} className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><div className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></div></div><p className="mt-4 text-xs text-muted-foreground">{help}</p></Link>)}</section>
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="flex items-center justify-between border-b px-6 py-5"><div><h2 className="font-bold">Today&apos;s patient flow</h2><p className="mt-1 text-sm text-muted-foreground">Open a booking to confirm, check in, complete, reschedule or recover it.</p></div><Link href="/dashboard/calendar" className="text-sm font-semibold text-primary hover:underline">Open diary</Link></div>{todayAppointments.length ? <div className="divide-y">{todayAppointments.map((appointment) => <Link key={appointment.id} href={`/dashboard/appointments/${appointment.id}`} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50"><div><p className="font-semibold">{appointment.appointmentTime} · {appointment.patientName}</p><p className="mt-1 text-sm text-muted-foreground">{appointment.treatment}{appointment.provider ? ` · ${appointment.provider.name}` : ""}{appointment.chair ? ` · ${appointment.chair.name}` : ""}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{appointment.status}</span></Link>)}</div> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">No bookings scheduled today.</p>}</section>
    {lowStock > 0 && <Link href="/dashboard/operations" className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><AlertTriangle className="size-5" /><span><strong>{lowStock} stock item(s) are at zero.</strong> Review supply availability before the clinic starts.</span></Link>}
  </div>;
}
