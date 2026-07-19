import { prisma } from "@/lib/prisma";

interface AppointmentData {
  name: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
}

export async function saveAppointment(data: AppointmentData) {
  const appointmentDate = new Date(data.date);

  console.log("Raw date:", data.date);
  console.log("Parsed date:", appointmentDate);

  if (isNaN(appointmentDate.getTime())) {
    throw new Error(`Invalid date: ${data.date}`);
  }

  return await prisma.appointment.create({
    data: {
      patientName: data.name,
      phone: data.phone,
      appointmentDate: appointmentDate,
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
