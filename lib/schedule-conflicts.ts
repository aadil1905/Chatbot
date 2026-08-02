import { prisma } from "@/lib/prisma";

type AppointmentSlot = {
  clinicId: number;
  appointmentDate: Date;
  appointmentTime: string;
  providerId?: number | null;
  chairId?: number | null;
  excludeAppointmentId?: number;
};

/** Blocks double-booking a named clinician or chair; unassigned enquiries remain allowed. */
export async function findScheduleConflict(slot: AppointmentSlot) {
  if (!slot.providerId && !slot.chairId) return null;
  const sameDay = new Date(slot.appointmentDate);
  sameDay.setHours(0, 0, 0, 0);
  const nextDay = new Date(sameDay);
  nextDay.setDate(nextDay.getDate() + 1);
  return prisma.appointment.findFirst({
    where: {
      clinicId: slot.clinicId,
      archivedAt: null,
      appointmentDate: { gte: sameDay, lt: nextDay },
      appointmentTime: slot.appointmentTime,
      status: { notIn: ["Cancelled", "No-show"] },
      ...(slot.excludeAppointmentId ? { id: { not: slot.excludeAppointmentId } } : {}),
      OR: [
        ...(slot.providerId ? [{ providerId: slot.providerId }] : []),
        ...(slot.chairId ? [{ chairId: slot.chairId }] : []),
      ],
    },
    include: { provider: true, chair: true },
    orderBy: { id: "asc" },
  });
}
