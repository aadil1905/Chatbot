import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  try {
  const body = await req.json();
  const data = appointmentSchema.parse(body);

  const appointment = await prisma.appointment.create({
  data: {
   patientName: data.patientName,
phone: data.phone,
appointmentDate: new Date(data.appointmentDate),
appointmentTime: data.appointmentTime,
treatment: data.treatment,
status: data.status,
notes: data.notes,
  },
});

 return NextResponse.json(appointment);
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