import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { prescriptionSchema } from "@/lib/validations";
import { requireApiUser } from "@/lib/tenant";

function localDate(value: string | Date) {
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

async function findCompletedAppointment(clinicId: number, patientId: number, value: string | Date) {
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

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const data = prescriptionSchema.parse(await request.json());
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, clinicId: user.clinicId }, select: { id: true } });
    if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    const appointment = await findCompletedAppointment(user.clinicId, patient.id, data.prescribedOn);
    if (!appointment) {
      return NextResponse.json(
        { error: "Select one of this patient's completed appointment dates." },
        { status: 400 },
      );
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.id,
        prescribedOn: localDate(data.prescribedOn),
        diagnosis: data.diagnosis || null,
        instructions: data.instructions || null,
        medicines: data.medicines,
      },
    });
    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Please check the prescription details.", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not save prescription." }, { status: 500 });
  }
}
