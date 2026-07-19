import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";
import { ZodError } from "zod";

function invoiceNumber() {
  return `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const data = invoiceSchema.parse(await request.json());
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNumber(),
        patientId: data.patientId,
        treatmentPlanId: data.treatmentPlanId === "" ? null : data.treatmentPlanId,
        issueDate: new Date(data.issueDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        totalAmount: data.totalAmount,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check the invoice details.", issues: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: "Could not create invoice." }, { status: 500 });
  }
}
