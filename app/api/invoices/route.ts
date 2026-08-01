import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";
import { ZodError } from "zod";
import { requireApiUser } from "@/lib/tenant";
import { findCompletedAppointment, localDate } from "@/lib/clinical-appointments";

function invoiceNumber() {
  return `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const data = invoiceSchema.parse(await request.json());
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, clinicId: user.clinicId }, select: { id: true } });
    if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    const treatmentPlanId = typeof data.treatmentPlanId === "number" ? data.treatmentPlanId : null;
    if (treatmentPlanId) {
      const plan = await prisma.treatmentPlan.findFirst({ where: { id: treatmentPlanId, patientId: patient.id } });
      if (!plan) return NextResponse.json({ error: "Treatment plan not found." }, { status: 404 });
    }
    const appointment = await findCompletedAppointment(user.clinicId, patient.id, data.issueDate);
    if (!appointment) {
      return NextResponse.json(
        { error: "Select one of this patient's completed appointment dates." },
        { status: 400 },
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNumber(),
        patientId: patient.id,
        treatmentPlanId,
        issueDate: localDate(data.issueDate),
        dueDate: data.dueDate ? localDate(data.dueDate) : null,
        totalAmount: data.totalAmount,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Please check the invoice details.", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not create invoice." }, { status: 500 });
  }
}
