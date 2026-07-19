import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const input = patientSchema.parse(await request.json());
    const patient = await prisma.patient.create({
      data: { ...input, email: input.email || null, dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null, gender: input.gender || null, address: input.address || null, medicalNotes: input.medicalNotes || null },
    });
    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Validation failed.", issues: error.flatten() }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "A patient with this phone number already exists." }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: "Failed to create patient." }, { status: 500 });
  }
}
