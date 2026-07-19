import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({ orderBy: { appointmentDate: "asc" } });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load appointments." }, { status: 500 });
  }
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

 return NextResponse.json(appointment, { status: 201 });
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
