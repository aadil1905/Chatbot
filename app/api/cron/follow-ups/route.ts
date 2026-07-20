import { NextRequest, NextResponse } from "next/server";
import { generateFollowUpTasks } from "@/lib/follow-ups";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clinics = await prisma.clinic.findMany({ select: { id: true } });
  const created = await Promise.all(clinics.map((clinic) => generateFollowUpTasks(clinic.id)));
  return NextResponse.json({ success: true, tasksCreated: created.reduce((total, count) => total + count, 0) });
}
