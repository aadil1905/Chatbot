"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const conditions = ["HEALTHY", "CARIES", "FILLING", "CROWN", "ROOT_CANAL", "MISSING", "IMPLANT", "WATCH"];

export async function saveDentalChartEntryAction(formData: FormData) {
  await requireUser();
  const patientId = Number(formData.get("patientId"));
  const toothNumber = String(formData.get("toothNumber") || "");
  const condition = String(formData.get("condition") || "HEALTHY");
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!Number.isInteger(patientId) || !toothNumber || !conditions.includes(condition)) return;
  await prisma.dentalChartEntry.upsert({
    where: { patientId_toothNumber: { patientId, toothNumber } },
    create: { patientId, toothNumber, condition, notes },
    update: { condition, notes },
  });
  revalidatePath(`/dashboard/clinical-workspace/${patientId}`);
}
