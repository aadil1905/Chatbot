import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
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
    const normalizedPhone = String(phone || "").replace(/\D/g, "").slice(-10);
    const patient = await prisma.patient.upsert({
      where: { clinicId_phone: { clinicId: user.clinicId, phone: normalizedPhone } },
      update: { fullName: name },
      create: { clinicId: user.clinicId, fullName: name, phone: normalizedPhone },
    });
    await prisma.appointment.create({
      data: {
        clinicId: user.clinicId,
        patientName: name,
        phone: normalizedPhone,
        appointmentDate: new Date(date),
        appointmentTime: time,
        treatment: problem,
        status: "Pending",
        source: "Reception",
        patientId: patient.id,
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
