import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const body = await req.json();

  const appointment = await prisma.appointment.create({
    data: {
      patientName: body.patientName,
      phone: body.phone,
      appointmentDate: new Date(body.appointmentDate),
      appointmentTime: body.appointmentTime,
      treatment: body.treatment,
    },
  });

  return NextResponse.json(appointment);
}