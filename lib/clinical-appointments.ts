import "server-only";

import { prisma } from "@/lib/prisma";

export function localDate(value: string | Date) {
  if (value instanceof Date) return value;
  return new Date(`${value.slice(0, 10)}T00:00:00.000+05:30`);
}

function localDayRange(value: string | Date) {
  const key = value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
  return {
    start: new Date(`${key}T00:00:00.000+05:30`),
    end: new Date(`${key}T23:59:59.999+05:30`),
  };
}

export async function findCompletedAppointment(clinicId: number, patientId: number, value: string | Date) {
  const range = localDayRange(value);
  return prisma.appointment.findFirst({
    where: {
      clinicId,
      patientId,
      status: "Completed",
      appointmentDate: { gte: range.start, lte: range.end },
    },
  });
}
