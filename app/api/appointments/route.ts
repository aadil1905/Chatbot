import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { getCurrentUser } from "@/lib/auth";
import { ZodError } from "zod";
import { findScheduleConflict } from "@/lib/schedule-conflicts";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const appointments = await prisma.appointment.findMany({
      where: { clinicId: user.clinicId, archivedAt: null },
      orderBy: { appointmentDate: "asc" },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load appointments." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const data = appointmentSchema.parse(body);
    const providerId = data.providerId ? Number(data.providerId) : null;
    const chairId = data.chairId ? Number(data.chairId) : null;
    const phone = data.phone.replace(/\D/g, "").slice(-10);
    const conflict = await findScheduleConflict({ clinicId: user.clinicId, appointmentDate: new Date(data.appointmentDate), appointmentTime: data.appointmentTime, providerId, chairId });
    if (conflict) {
      const resource = conflict.provider?.name || conflict.chair?.name || "the selected resource";
      return NextResponse.json({ error: `${resource} is already booked at this time for ${conflict.patientName}.` }, { status: 409 });
    }
    const patient = await prisma.patient.upsert({
          where: { clinicId_phone: { clinicId: user.clinicId, phone } },
          update: { fullName: data.patientName },
          create: { clinicId: user.clinicId, fullName: data.patientName, phone },
        });
    const priorIntake = await prisma.patientIntakeRequest.findFirst({
      where: { clinicId: user.clinicId, patientId: patient.id, status: { in: ["COMPLETED", "REVIEWED"] } },
      select: { id: true },
    });

    const appointment = await prisma.appointment.create({
      data: {
        clinicId: user.clinicId,
        patientName: data.patientName,
        phone,
        appointmentDate: new Date(data.appointmentDate),
        appointmentTime: data.appointmentTime,
        treatment: data.treatment,
        status: data.status,
        notes: data.notes,
        providerId,
        chairId,
        patientId: patient.id,
        source: "Reception",
      },
    });

    return NextResponse.json({
      ...appointment,
      intakeRequired: data.treatment.toLowerCase() === "new consultation" && !priorIntake,
    }, { status: 201 });
  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          issues: error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create appointment.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    }
    if (user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the clinic owner can archive all appointments." },
        { status: 403 },
      );
    }

    const result = await prisma.appointment.updateMany({
      where: { clinicId: user.clinicId, archivedAt: null },
      data: { archivedAt: new Date() },
    });
    return NextResponse.json({
      success: true,
      archivedCount: result.count,
    });
  } catch (error) {
    console.error("Archive all appointments failed", error);
    return NextResponse.json(
      { error: "Could not archive appointments." },
      { status: 500 },
    );
  }
}
