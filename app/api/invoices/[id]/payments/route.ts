import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const invoiceId = Number(id);
    if (!Number.isInteger(invoiceId)) return NextResponse.json({ error: "Invalid invoice." }, { status: 400 });
    const data = paymentSchema.parse(await request.json());
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    const paidSoFar = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (paidSoFar + data.amount > invoice.totalAmount) return NextResponse.json({ error: "Payment exceeds the outstanding amount." }, { status: 400 });
    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({ data: { invoiceId, amount: data.amount, method: data.method, paidAt: new Date(data.paidAt), notes: data.notes || null } });
      const status = paidSoFar + data.amount === invoice.totalAmount ? "Paid" : "Partially Paid";
      await tx.invoice.update({ where: { id: invoiceId }, data: { status } });
      return created;
    });
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check the payment details.", issues: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: "Could not record payment." }, { status: 500 });
  }
}
