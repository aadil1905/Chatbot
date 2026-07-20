import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AppointmentActions from "@/components/appointments/AppointmentActions";
import StatusBadge from "@/components/appointments/StatusBadge";
import type { AppointmentStatus } from "@/types/appointment";

type Props = { params: Promise<{ id: string }> };

export default async function AppointmentDetailsPage({ params }: Props) {
  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({ where: { id: Number(id) } });

  if (!appointment) return <div className="py-20 text-center"><h1 className="text-2xl font-bold">Appointment not found</h1><Link href="/dashboard/appointments" className="mt-4 inline-block text-primary hover:underline">Back to appointments</Link></div>;

  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Appointments</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Appointment details</h1><p className="mt-1 text-muted-foreground">View and manage appointment information.</p></div>
      <Link href="/dashboard/appointments" className="inline-flex h-10 items-center self-start rounded-xl border border-border bg-card px-4 text-sm font-semibold shadow-sm transition hover:bg-muted">← Back</Link>
    </header>
    <div className="grid gap-5 md:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><h2 className="text-lg font-bold tracking-tight">Patient information</h2><dl className="mt-6 grid gap-5 sm:grid-cols-2"><div><dt className="text-sm font-medium text-muted-foreground">Patient name</dt><dd className="mt-1 text-lg font-semibold">{appointment.patientName}</dd></div><div><dt className="text-sm font-medium text-muted-foreground">Phone</dt><dd className="mt-1 font-semibold">{appointment.phone}</dd></div></dl></section>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><h2 className="text-lg font-bold tracking-tight">Appointment</h2><dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5"><div><dt className="text-sm font-medium text-muted-foreground">Date</dt><dd className="mt-1 font-semibold">{appointment.appointmentDate.toLocaleDateString()}</dd></div><div><dt className="text-sm font-medium text-muted-foreground">Time</dt><dd className="mt-1 font-semibold">{appointment.appointmentTime}</dd></div><div><dt className="text-sm font-medium text-muted-foreground">Treatment</dt><dd className="mt-1 font-semibold">{appointment.treatment}</dd></div><div><dt className="text-sm font-medium text-muted-foreground">Status</dt><dd className="mt-2"><StatusBadge status={appointment.status as AppointmentStatus} /></dd></div></dl></section>
    </div>
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><h2 className="text-lg font-bold tracking-tight">Actions</h2><div className="mt-5"><AppointmentActions appointment={{ id: appointment.id, patientName: appointment.patientName, phone: appointment.phone, appointmentDate: appointment.appointmentDate.toISOString(), appointmentTime: appointment.appointmentTime, treatment: appointment.treatment, status: appointment.status as AppointmentStatus, notes: appointment.notes }} reminderSentAt={appointment.reminderSentAt?.toISOString() ?? null} /></div></section>
  </div>;
}
