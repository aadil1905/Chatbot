import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { treatmentPlanSchema } from "@/lib/validations";
import { ZodError } from "zod";
import { requireApiPermission } from "@/lib/tenant";
import { findCompletedAppointment, localDate } from "@/lib/clinical-appointments";

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiPermission("manageClinical");
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
    for (const item of data.items) {
      if (!item.serviceId) continue;
      const service = await prisma.clinicService.findFirst({ where: { id: item.serviceId, clinicId: user.clinicId }, select: { id: true } });
      if (!service) return NextResponse.json({ error: "One of the selected services was not found." }, { status: 404 });
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
        estimatedCost: data.items.reduce((sum, item) => sum + item.price, 0),
        notes: data.notes || null,
        selectedTeeth: toothNumbers.length ? { create: toothNumbers.map((toothNumber) => ({ toothNumber })) } : undefined,
        items: { create: data.items.map((item) => ({ serviceId: item.serviceId || null, name: item.name, price: item.price })) },
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
