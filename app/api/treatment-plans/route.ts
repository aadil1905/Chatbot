import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { treatmentPlanSchema } from "@/lib/validations";
import { ZodError } from "zod";
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
    const data = treatmentPlanSchema.parse(await request.json());
    if (!data.visitDate) {
      return NextResponse.json(
        { error: "Select one of this patient's completed appointment dates." },
        { status: 400 },
      );
    }
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, clinicId: user.clinicId }, select: { id: true } });
    if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    if (data.serviceId) {
      const service = await prisma.clinicService.findFirst({ where: { id: data.serviceId, clinicId: user.clinicId }, select: { id: true } });
      if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }
    const appointment = await findCompletedAppointment(user.clinicId, patient.id, data.visitDate);
    if (!appointment) {
      return NextResponse.json(
        { error: "Select one of this patient's completed appointment dates." },
        { status: 400 },
      );
    }

    const price = data.unitPrice === "" || data.unitPrice === undefined
      ? (data.estimatedCost === "" || data.estimatedCost === undefined ? null : data.estimatedCost)
      : data.unitPrice;
    const toothNumbers = Array.from(new Set([...(data.toothNumbers || []), data.toothNumber || ""].map((tooth) => tooth.trim()).filter(Boolean)));
    const plan = await prisma.treatmentPlan.create({
      data: {
        patientId: patient.id,
        visitDate: localDate(data.visitDate),
        title: data.title,
        status: data.status,
        serviceId: data.serviceId === "" || data.serviceId === undefined ? null : data.serviceId,
        toothNumber: toothNumbers[0] || null,
        unitPrice: price,
        estimatedCost: price,
        notes: data.notes || null,
        selectedTeeth: toothNumbers.length ? { create: toothNumbers.map((toothNumber) => ({ toothNumber })) } : undefined,
      },
    });
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed.", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not create treatment plan." }, { status: 500 });
  }
}
