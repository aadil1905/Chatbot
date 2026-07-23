import { prisma } from "@/lib/prisma";

interface AppointmentData {
  name: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
}

export async function saveAppointment(data: AppointmentData) {
  const appointmentDate = new Date(`${data.date}T12:00:00`);

  if (Number.isNaN(appointmentDate.getTime())) {
    throw new Error("Invalid appointment date");
  }

  return prisma.appointment.create({
    data: {
      patientName: data.name,
      phone: data.phone,
      appointmentDate,
      appointmentTime: data.time,
      treatment: data.reason,
      patient: {
        connectOrCreate: {
          where: { phone: data.phone },
          create: { fullName: data.name, phone: data.phone },
        },
      },
    },
  });
}