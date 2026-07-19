import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clinicalRecordSchema } from "@/lib/validations";
import { ZodError } from "zod";
export async function POST(request: Request) { try { const data = clinicalRecordSchema.parse(await request.json()); const record = await prisma.clinicalRecord.create({ data: { ...data, visitDate: new Date(data.visitDate), diagnosis: data.diagnosis || null, clinicalNotes: data.clinicalNotes || null } }); return NextResponse.json(record, { status: 201 }); } catch (error) { if (error instanceof ZodError) return NextResponse.json({ error: "Validation failed.", issues: error.flatten() }, { status: 400 }); return NextResponse.json({ error: "Could not create clinical record." }, { status: 500 }); } }
