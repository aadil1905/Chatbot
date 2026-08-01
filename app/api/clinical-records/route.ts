import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clinicalRecordSchema } from "@/lib/validations";
import { ZodError } from "zod";

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

async function findCompletedAppointment(patientId: number, value: string | Date) {
  const range = localDayRange(value);
  return prisma.appointment.findFirst({
    where: {
      patientId,
      status: "Completed",
      appointmentDate: { gte: range.start, lte: range.end },
    },
  });
}

function optionalText(value?: string) {
  const text = value?.trim();
  return text ? text : null;
}

function clinicalRecordData(data: ReturnType<typeof clinicalRecordSchema.parse>) {
  return {
    patientId: data.patientId,
    visitDate: localDate(data.visitDate),
    chiefComplaint: data.chiefComplaint,
    diagnosis: optionalText(data.diagnosis),
    clinicalNotes: optionalText(data.clinicalNotes),
    medicalHistory: data.medicalHistory?.length ? JSON.stringify(data.medicalHistory) : null,
    drugAllergies: optionalText(data.drugAllergies),
    medications: optionalText(data.medications),
    otherHistory: optionalText(data.otherHistory),
    bloodPressure: optionalText(data.bloodPressure),
    weightKg: optionalText(data.weightKg),
    dentalHistory: optionalText(data.dentalHistory),
    treatmentDone: optionalText(data.treatmentDone),
    estimateAmount: data.estimateAmount === "" ? null : data.estimateAmount ?? null,
    consentGiven: Boolean(data.consentGiven),
    consentNotes: optionalText(data.consentNotes),
  };
}

export async function POST(request: Request) {
  try {
    const data = clinicalRecordSchema.parse(await request.json());
    const appointment = await findCompletedAppointment(data.patientId, data.visitDate);
    if (!appointment) {
      return NextResponse.json(
        { error: "Select one of this patient's completed appointment dates." },
        { status: 400 },
      );
    }

    const record = await prisma.clinicalRecord.create({
      data: clinicalRecordData(data),
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed.", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not create clinical record." }, { status: 500 });
  }
}
