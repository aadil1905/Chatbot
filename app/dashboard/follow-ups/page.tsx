export const dynamic = "force-dynamic";

import Link from "next/link";
import { BellRing, CalendarClock, CheckCircle2, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/appointments/StatusBadge";
import SendReminderButton from "@/components/appointments/SendReminderButton";
import type { AppointmentStatus } from "@/types/appointment";

function startOfDay(value: Date) { const day = new Date(value); day.setHours(0, 0, 0, 0); return day; }

export default async function FollowUpsPage() {
  const today = startOfDay(new Date());
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
  const appointments = await prisma.appointment.findMany({
    where: { status: { in: ["Pending", "Confirmed"] } },
    orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
    take: 100,
  });
  const overdue = appointments.filter((item) => item.appointmentDate < today);
  const reminderQueue = appointments.filter((item) => item.appointmentDate >= today && item.appointmentDate < nextWeek && !item.reminderSentAt);
  const alreadyReminded = appointments.filter((item) => item.appointmentDate >= today && item.appointmentDate < nextWeek && item.reminderSentAt);
  const summary = [
    { label: "Needs follow-up", value: overdue.length, icon: CalendarClock, tone: "bg-amber-50 text-amber-700" },
    { label: "Reminders to send", value: reminderQueue.length, icon: MessageCircle, tone: "bg-cyan-50 text-cyan-700" },
    { label: "Reminders sent", value: alreadyReminded.length, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
  ];
  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Patient communication</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Follow-up centre</h1><p className="mt-2 text-muted-foreground">Review appointments that need attention and send WhatsApp reminders from one place.</p></div><Link href="/dashboard/calendar" className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold shadow-sm transition hover:bg-muted">Open calendar</Link></header>
    <section className="grid gap-4 sm:grid-cols-3">{summary.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><div className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></div></div></article>)}</section>
    <Queue title="Send upcoming WhatsApp reminders" description="Appointments in the next 7 days that have not received a manual reminder." empty="No reminders need to be sent right now." items={reminderQueue} action="reminder" />
    <Queue title="Overdue appointment follow-ups" description="Pending or confirmed appointments before today. Contact the patient or update the appointment status." empty="No overdue follow-ups. Nice work." items={overdue} action="view" />
    <Queue title="Recently reminded" description="Upcoming appointments that already received a manual WhatsApp reminder." empty="No reminders have been sent for the upcoming week yet." items={alreadyReminded} action="view" />
  </div>;
}

type QueueItem = { id: number; patientName: string; phone: string; appointmentDate: Date; appointmentTime: string; treatment: string; status: string; reminderSentAt: Date | null };
function Queue({ title, description, empty, items, action }: { title: string; description: string; empty: string; items: QueueItem[]; action: "reminder" | "view" }) {
  return <section className="rounded-2xl border border-border bg-card shadow-sm"><div className="border-b border-border px-6 py-5"><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{items.length === 0 ? <div className="px-6 py-10 text-center text-sm text-muted-foreground">{empty}</div> : <div className="divide-y divide-border">{items.map((appointment) => <article key={appointment.id} className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Link href={`/dashboard/appointments/${appointment.id}`} className="font-semibold hover:text-primary hover:underline">{appointment.patientName}</Link><StatusBadge status={appointment.status as AppointmentStatus} /></div><p className="mt-1 text-sm text-muted-foreground">{appointment.treatment} · {appointment.appointmentDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at {appointment.appointmentTime}</p><p className="mt-1 text-xs text-muted-foreground">{appointment.phone}{appointment.reminderSentAt ? ` · Reminder sent ${appointment.reminderSentAt.toLocaleDateString("en-IN")}` : ""}</p></div><div className="shrink-0">{action === "reminder" ? <SendReminderButton appointmentId={appointment.id} sentAt={null} /> : <Link href={`/dashboard/appointments/${appointment.id}`} className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold transition hover:bg-muted">View appointment</Link>}</div></article>)}</div>}</section>;
}
