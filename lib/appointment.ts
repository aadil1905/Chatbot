import { prisma } from "@/lib/prisma";

interface AppointmentData {
  clinicId: number;
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

  const patient = await prisma.patient.upsert({
    where: { clinicId_phone: { clinicId: data.clinicId, phone: data.phone } },
    update: { fullName: data.name },
    create: { clinicId: data.clinicId, fullName: data.name, phone: data.phone },
  });
  return prisma.appointment.create({
    data: {
      clinicId: data.clinicId,
      patientName: data.name,
      phone: data.phone,
      appointmentDate,
      appointmentTime: data.time,
      treatment: data.reason,
      patientId: patient.id,
      source: "WhatsApp",
    },
  });
}
