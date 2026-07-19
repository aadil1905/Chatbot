import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const body = await request.json();

    const appointment = await prisma.appointment.update({
      where: {
        id: Number(id),
      },
      data: {
        patientName:
          body.patientName !== undefined
            ? body.patientName
            : undefined,

        phone:
          body.phone !== undefined
            ? body.phone
            : undefined,

        appointmentDate:
          body.appointmentDate !== undefined
            ? new Date(body.appointmentDate)
            : undefined,

        appointmentTime:
          body.appointmentTime !== undefined
            ? body.appointmentTime
            : undefined,

        treatment:
          body.treatment !== undefined
            ? body.treatment
            : undefined,

        status:
          body.status !== undefined
            ? body.status
            : undefined,

        notes:
          body.notes !== undefined
            ? body.notes
            : undefined,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update appointment." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    await prisma.appointment.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete appointment." },
      { status: 500 }
    );
  }
}