export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/appointments/StatusBadge";

function startOfToday() { const date = new Date(); date.setHours(0, 0, 0, 0); return date; }

export default async function DashboardPage() {
  const today = startOfToday();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const [todayCount, pendingCount, completedCount, totalPatients, upcoming] = await prisma.$transaction([
    prisma.appointment.count({ where: { appointmentDate: { gte: today, lt: tomorrow } } }),
    prisma.appointment.count({ where: { status: "Pending" } }),
    prisma.appointment.count({ where: { status: "Completed" } }),
    prisma.appointment.count({ where: { appointmentDate: { gte: today } } }),
    prisma.appointment.findMany({ where: { appointmentDate: { gte: today }, status: { not: "Cancelled" } }, orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }], take: 5 }),
  ]);
  const stats = [
    { title: "Today's appointments", value: todayCount, icon: CalendarDays },
    { title: "Awaiting confirmation", value: pendingCount, icon: Clock3 },
    { title: "Completed", value: completedCount, icon: CheckCircle2 },
    { title: "Upcoming bookings", value: totalPatients, icon: Users },
  ];

  return <div className="space-y-8">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1><p className="mt-1 text-muted-foreground">A live view of your clinic&apos;s appointment activity.</p></div><Link href="/dashboard/appointments/new" className="text-sm font-medium text-primary hover:underline">Create appointment</Link></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ title, value, icon: Icon }) => <Card key={title}><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><Icon className="size-8 text-primary/70" /></CardContent></Card>)}</div>
    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Upcoming appointments</CardTitle><Link href="/dashboard/appointments" className="text-sm font-medium text-primary hover:underline">View all</Link></CardHeader><CardContent>{upcoming.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No upcoming appointments.</div> : <div className="divide-y">{upcoming.map((appointment) => <Link key={appointment.id} href={`/dashboard/appointments/${appointment.id}`} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{appointment.patientName}</p><p className="text-sm text-muted-foreground">{appointment.treatment} · {appointment.appointmentDate.toLocaleDateString(undefined, { day: "numeric", month: "short" })} at {appointment.appointmentTime}</p></div><StatusBadge status={appointment.status as "Pending" | "Confirmed" | "Completed" | "Cancelled"} /></Link>)}</div>}</CardContent></Card>
  </div>;
}
