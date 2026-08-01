import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const formSchema = z.object({
  medicalHistory: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  drugAllergies: z.string().trim().max(1000).optional().default(""),
  medications: z.string().trim().max(1000).optional().default(""),
  otherHistory: z.string().trim().max(1000).optional().default(""),
  bloodPressure: z.string().trim().max(40).optional().default(""),
  weightKg: z.string().trim().max(40).optional().default(""),
  dentalHistory: z.string().trim().max(3000).optional().default(""),
  consentGiven: z.literal(true),
  consentNotes: z.string().trim().max(2000).optional().default(""),
  patientSignature: z.string().startsWith("data:image/svg+xml;base64,").max(500000),
  guardianSignature: z.union([z.literal(""), z.string().startsWith("data:image/svg+xml;base64,").max(500000)]).optional().default(""),
});

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  try {
    const input = formSchema.parse(await request.json());
    const intake = await prisma.patientIntakeRequest.findUnique({ where: { token } });
    if (!intake) return NextResponse.json({ error: "This form link is invalid." }, { status: 404 });
    if (intake.expiresAt <= new Date()) return NextResponse.json({ error: "This form link has expired. Please contact the clinic." }, { status: 410 });
    if (["COMPLETED", "REVIEWED"].includes(intake.status)) {
      return NextResponse.json({ success: true, alreadyCompleted: true });
    }

    const completedAt = new Date();
    await prisma.$transaction([
      prisma.patientIntakeRequest.update({
        where: { id: intake.id },
        data: {
        status: "COMPLETED",
        medicalHistory: JSON.stringify(input.medicalHistory),
        drugAllergies: input.drugAllergies || null,
        medications: input.medications || null,
        otherHistory: input.otherHistory || null,
        bloodPressure: input.bloodPressure || null,
        weightKg: input.weightKg || null,
        dentalHistory: input.dentalHistory || null,
        consentGiven: true,
        consentNotes: input.consentNotes || "Patient accepted the clinic consent statement.",
        patientSignature: input.patientSignature,
        guardianSignature: input.guardianSignature || null,
        completedAt,
        },
      }),
      prisma.clinicalRecord.create({
        data: {
          patientId: intake.patientId,
          visitDate: completedAt,
          chiefComplaint: "Initial patient intake",
          clinicalNotes: "Secure patient-intake form completed; awaiting clinic review.",
          medicalHistory: JSON.stringify(input.medicalHistory),
          drugAllergies: input.drugAllergies || null,
          medications: input.medications || null,
          otherHistory: input.otherHistory || null,
          bloodPressure: input.bloodPressure || null,
          weightKg: input.weightKg || null,
          dentalHistory: input.dentalHistory || null,
          consentGiven: true,
          consentNotes: input.consentNotes || "Patient accepted the clinic consent statement.",
          patientSignature: input.patientSignature,
          guardianSignature: input.guardianSignature || null,
          consentSignedAt: completedAt,
        },
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Please complete the required fields." }, { status: 400 });
    }
    console.error("Public intake submission failed", error);
    return NextResponse.json({ error: "Your form could not be submitted. Please try again." }, { status: 500 });
  }
}
