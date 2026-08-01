import { NextRequest, NextResponse } from "next/server";
import { sendAbandonedBookingReminders } from "@/lib/booking";

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");

  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const remindersSent = await sendAbandonedBookingReminders();
  return NextResponse.json({ success: true, remindersSent });
}
