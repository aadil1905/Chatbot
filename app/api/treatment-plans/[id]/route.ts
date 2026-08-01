import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { treatmentPlanSchema } from "@/lib/validations";
import { ZodError } from "zod";
import { requireApiUser } from "@/lib/tenant";
import { findCompletedAppointment, localDate } from "@/lib/clinical-appointments";

async function getId(params: Promise<{ id: string }>) {
  const { id } = await params;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const id = await getId(params);
    if (!id) return NextResponse.json({ error: "Invalid plan id." }, { status: 400 });

    const existingPlan = await prisma.treatmentPlan.findFirst({ where: { id, patient: { clinicId: user.clinicId } } });
    if (!existingPlan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

    const { patientId: requestedPatientId, serviceId, toothNumber, unitPrice, estimatedCost, notes, visitDate, ...data } = treatmentPlanSchema.partial().parse(await request.json());
    const patientId = requestedPatientId ?? existingPlan.patientId;
    if (requestedPatientId) {
      const patient = await prisma.patient.findFirst({ where: { id: requestedPatientId, clinicId: user.clinicId }, select: { id: true } });
      if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }
    if (serviceId) {
      const service = await prisma.clinicService.findFirst({ where: { id: serviceId, clinicId: user.clinicId }, select: { id: true } });
      if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    if (visitDate) {
      const appointment = await findCompletedAppointment(user.clinicId, patientId, visitDate);
      if (!appointment) {
        return NextResponse.json(
          { error: "Select one of this patient's completed appointment dates." },
          { status: 400 },
        );
      }
    }

    const plan = await prisma.treatmentPlan.update({
      where: { id },
      data: {
        ...data,
        visitDate: visitDate ? localDate(visitDate) : undefined,
        serviceId: serviceId === "" ? null : serviceId,
        toothNumber: toothNumber === "" ? null : toothNumber,
        unitPrice: unitPrice === "" ? null : unitPrice,
        estimatedCost: estimatedCost === "" ? null : estimatedCost,
        notes: notes === "" ? null : notes,
      },
    });
    return NextResponse.json(plan);
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Validation failed." }, { status: 400 });
    return NextResponse.json({ error: "Plan not found or could not be updated." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser();
  if (!user) return response;
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "Invalid plan id." }, { status: 400 });
  try {
    const result = await prisma.treatmentPlan.deleteMany({ where: { id, patient: { clinicId: user.clinicId } } });
    if (!result.count) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  }
}
