import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { treatmentPlanSchema } from "@/lib/validations";
import { ZodError } from "zod";
import { requireApiPermission } from "@/lib/tenant";
import { findCompletedAppointment, localDate } from "@/lib/clinical-appointments";

async function getId(params: Promise<{ id: string }>) {
  const { id } = await params;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireApiPermission("manageClinical");
    if (!user) return response;
    const id = await getId(params);
    if (!id) return NextResponse.json({ error: "Invalid plan id." }, { status: 400 });

    const existingPlan = await prisma.treatmentPlan.findFirst({ where: { id, patient: { clinicId: user.clinicId } } });
    if (!existingPlan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

    const { patientId: requestedPatientId, serviceId, toothNumber, toothNumbers, unitPrice, estimatedCost, notes, visitDate, items, ...data } = treatmentPlanSchema.partial().parse(await request.json());
    const patientId = requestedPatientId ?? existingPlan.patientId;
    if (requestedPatientId) {
      const patient = await prisma.patient.findFirst({ where: { id: requestedPatientId, clinicId: user.clinicId }, select: { id: true } });
      if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }
    if (serviceId) {
      const service = await prisma.clinicService.findFirst({ where: { id: serviceId, clinicId: user.clinicId }, select: { id: true } });
      if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }
    if (items) for (const item of items) {
      if (!item.serviceId) continue;
      const service = await prisma.clinicService.findFirst({ where: { id: item.serviceId, clinicId: user.clinicId }, select: { id: true } });
      if (!service) return NextResponse.json({ error: "One of the selected services was not found." }, { status: 404 });
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

    const selectedToothNumbers = toothNumbers ? Array.from(new Set([...toothNumbers, toothNumber || ""].map((tooth) => tooth.trim()).filter(Boolean))) : undefined;
    const plan = await prisma.treatmentPlan.update({
      where: { id },
      data: {
        ...data,
        visitDate: visitDate ? localDate(visitDate) : undefined,
        serviceId: serviceId === "" ? null : serviceId,
        toothNumber: selectedToothNumbers ? selectedToothNumbers[0] || null : toothNumber === "" ? null : toothNumber,
        unitPrice: unitPrice === "" ? null : unitPrice,
        notes: notes === "" ? null : notes,
        estimatedCost: items ? items.reduce((sum, item) => sum + item.price, 0) : estimatedCost === "" ? null : estimatedCost,
        selectedTeeth: selectedToothNumbers ? { deleteMany: {}, create: selectedToothNumbers.map((toothNumber) => ({ toothNumber })) } : undefined,
        items: items ? { deleteMany: {}, create: items.map((item) => ({ serviceId: item.serviceId || null, name: item.name, price: item.price })) } : undefined,
      },
    });
    return NextResponse.json(plan);
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Validation failed." }, { status: 400 });
    return NextResponse.json({ error: "Plan not found or could not be updated." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, response } = await requireApiPermission("manageClinical");
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
