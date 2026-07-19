import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { treatmentPlanSchema } from "@/lib/validations";
import { ZodError } from "zod";
export async function POST(request: Request) { try { const data = treatmentPlanSchema.parse(await request.json()); const plan = await prisma.treatmentPlan.create({ data: { ...data, estimatedCost: data.estimatedCost === "" ? null : data.estimatedCost, notes: data.notes || null } }); return NextResponse.json(plan, { status: 201 }); } catch (error) { if (error instanceof ZodError) return NextResponse.json({ error: "Validation failed.", issues: error.flatten() }, { status: 400 }); return NextResponse.json({ error: "Could not create treatment plan." }, { status: 500 }); } }
