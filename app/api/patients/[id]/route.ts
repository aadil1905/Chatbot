import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validations";
import { ZodError } from "zod";

async function patientId(params: Promise<{ id: string }>) { const { id } = await params; const value = Number(id); return Number.isInteger(value) && value > 0 ? value : null; }

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await patientId(params); if (!id) return NextResponse.json({ error: "Invalid patient id." }, { status: 400 });
    const input = patientSchema.partial().parse(await request.json());
    if (!Object.keys(input).length) return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    const patient = await prisma.patient.update({ data: { ...input, email: input.email === "" ? null : input.email, dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : input.dateOfBirth === "" ? null : undefined, gender: input.gender === "" ? null : input.gender, address: input.address === "" ? null : input.address, medicalNotes: input.medicalNotes === "" ? null : input.medicalNotes }, where: { id } });
    return NextResponse.json(patient);
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Validation failed.", issues: error.flatten() }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "A patient with this phone number already exists." }, { status: 409 });
    return NextResponse.json({ error: "Patient not found or could not be updated." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const id = await patientId(params); if (!id) return NextResponse.json({ error: "Invalid patient id." }, { status: 400 }); await prisma.patient.delete({ where: { id } }); return NextResponse.json({ success: true }); }
  catch { return NextResponse.json({ error: "Patient not found or could not be deleted." }, { status: 404 }); }
}
