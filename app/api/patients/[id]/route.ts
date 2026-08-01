import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validations";
import { ZodError } from "zod";
import { getCurrentUser } from "@/lib/auth";

async function patientId(params: Promise<{ id: string }>) { const { id } = await params; const value = Number(id); return Number.isInteger(value) && value > 0 ? value : null; }

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const id = await patientId(params); if (!id) return NextResponse.json({ error: "Invalid patient id." }, { status: 400 });
    const rawInput = await request.json();
    if (typeof rawInput.fullName === "string") rawInput.fullName = rawInput.fullName.trim();
    if (typeof rawInput.phone === "string") rawInput.phone = rawInput.phone.replace(/\D/g, "").slice(-10);
    if (typeof rawInput.email === "string") rawInput.email = rawInput.email.trim().toLowerCase();
    if (typeof rawInput.address === "string") rawInput.address = rawInput.address.trim();
    if (typeof rawInput.medicalNotes === "string") rawInput.medicalNotes = rawInput.medicalNotes.trim();
    if (typeof rawInput.dateOfBirth === "string" && /^\d{2}-\d{2}-\d{4}$/.test(rawInput.dateOfBirth)) {
      const [day, month, year] = rawInput.dateOfBirth.split("-");
      rawInput.dateOfBirth = `${year}-${month}-${day}`;
    }
    const input = patientSchema.partial().parse(rawInput);
    if (!Object.keys(input).length) return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    const owned = await prisma.patient.findFirst({ where: { id, clinicId: user.clinicId }, select: { id: true } });
    if (!owned) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    const patient = await prisma.patient.update({ data: { ...input, email: input.email === "" ? null : input.email, dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : input.dateOfBirth === "" ? null : undefined, gender: input.gender === "" ? null : input.gender, address: input.address === "" ? null : input.address, medicalNotes: input.medicalNotes === "" ? null : input.medicalNotes }, where: { id: owned.id } });
    return NextResponse.json(patient);
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Validation failed.", issues: error.flatten() }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "A patient with this phone number already exists." }, { status: 409 });
    return NextResponse.json({ error: "Patient not found or could not be updated." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 }); const id = await patientId(params); if (!id) return NextResponse.json({ error: "Invalid patient id." }, { status: 400 }); const result = await prisma.patient.deleteMany({ where: { id, clinicId: user.clinicId } }); if (!result.count) return NextResponse.json({ error: "Patient not found." }, { status: 404 }); return NextResponse.json({ success: true }); }
  catch { return NextResponse.json({ error: "Patient not found or could not be deleted." }, { status: 404 }); }
}
