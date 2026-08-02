import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cleanPhone(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}

function followUpMessage(name: string) {
  return `Hi ${name}, this is Dr. Deepika's Dental White. We noticed you tried contacting the clinic. Would you like to book an appointment? Please reply here to continue.`;
}

export async function POST(req: NextRequest) {
  const configuredSecret = process.env.MISSED_CALL_WEBHOOK_SECRET;
  const configuredClinicId = Number(process.env.MISSED_CALL_CLINIC_ID);
  if (!configuredSecret || !Number.isInteger(configuredClinicId) || configuredClinicId <= 0) return NextResponse.json({ error: "Missed-call webhook is not configured." }, { status: 503 });
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || req.nextUrl.searchParams.get("token");
  if (token !== configuredSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const payload = body as Record<string, unknown>;
  const phone = cleanPhone(payload.phone || payload.caller || payload.from || payload.mobile);
  if (phone.length < 10) return NextResponse.json({ error: "Valid phone is required" }, { status: 400 });

  const clinic = await prisma.clinic.findUnique({ where: { id: configuredClinicId } });
  if (!clinic) return NextResponse.json({ error: "Clinic not configured" }, { status: 503 });

  const name = String(payload.callerName || payload.name || "").trim() || `Missed call ${phone.slice(-4)}`;
  const notes = String(payload.notes || payload.reason || "").trim();
  const callReceivedAtValue = String(payload.callReceivedAt || payload.timestamp || payload.time || "");
  const callReceivedAt = callReceivedAtValue ? new Date(callReceivedAtValue) : new Date();

  const missedCall = await prisma.followUpTask.create({
    data: {
      clinicId: clinic.id,
      patientName: name,
      phone,
      taskType: "MISSED_CALL",
      status: "PENDING",
      message: notes ? `${followUpMessage(name)}\n\nProvider note: ${notes}` : followUpMessage(name),
      scheduledFor: Number.isNaN(callReceivedAt.getTime()) ? new Date() : callReceivedAt,
    },
  });

  return NextResponse.json({ success: true, id: missedCall.id });
}
