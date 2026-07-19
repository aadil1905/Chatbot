import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      phone,
      date,
      time,
      problem,
    } = body;

    console.log("========== NEW APPOINTMENT ==========");
    console.log("Name:", name);
    console.log("Phone:", phone);
    console.log("Date:", date);
    console.log("Time:", time);
    console.log("Problem:", problem);
    console.log("=====================================");
await prisma.appointment.create({
  data: {
    patientName: name,
    phone,
    appointmentDate: new Date(date),
    appointmentTime: time,
    treatment: problem,
    patient: {
      connectOrCreate: {
        where: { phone },
        create: { fullName: name, phone },
      },
    },
  },
});
    return NextResponse.json({
      success: true,
      message: "Appointment saved successfully.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}
