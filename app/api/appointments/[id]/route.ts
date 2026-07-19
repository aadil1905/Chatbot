import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const appointmentId = Number(id);
    if (!Number.isInteger(appointmentId) || appointmentId < 1) {
      return NextResponse.json({ error: "Invalid appointment id." }, { status: 400 });
    }

    const body = await request.json();
    const data = appointmentSchema.partial().parse(body);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    }

    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        patientName:
          data.patientName !== undefined
            ? data.patientName
            : undefined,

        phone:
          data.phone !== undefined
            ? data.phone
            : undefined,

        appointmentDate:
          data.appointmentDate !== undefined
            ? new Date(data.appointmentDate)
            : undefined,

        appointmentTime:
          data.appointmentTime !== undefined
            ? data.appointmentTime
            : undefined,

        treatment:
          data.treatment !== undefined
            ? data.treatment
            : undefined,

        status:
          data.status !== undefined
            ? data.status
            : undefined,

        notes:
          data.notes !== undefined
            ? data.notes
            : undefined,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed.", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Appointment not found or could not be updated." },
      { status: 404 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const appointmentId = Number(id);
    if (!Number.isInteger(appointmentId) || appointmentId < 1) {
      return NextResponse.json({ error: "Invalid appointment id." }, { status: 400 });
    }

    await prisma.appointment.delete({
      where: {
        id: appointmentId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Appointment not found or could not be deleted." },
      { status: 404 }
    );
  }
}
