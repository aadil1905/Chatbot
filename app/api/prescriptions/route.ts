import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { prescriptionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const data = prescriptionSchema.parse(await request.json());
    const prescription = await prisma.prescription.create({
      data: {
        patientId: data.patientId,
        prescribedOn: new Date(data.prescribedOn),
        diagnosis: data.diagnosis || null,
        instructions: data.instructions || null,
        medicines: data.medicines,
      },
    });
    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check the prescription details.", issues: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: "Could not save prescription." }, { status: 500 });
  }
}
