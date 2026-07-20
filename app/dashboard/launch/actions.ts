"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const checklistFields = ["whatsappWebhookVerified", "whatsappTemplatesApproved", "backupOwnerAssigned", "clinicTeamTrained", "backupPlanReviewed"] as const;

export async function toggleLaunchItemAction(formData: FormData) {
  const user = await requireOwner();
  const field = String(formData.get("field") || "");
  const value = String(formData.get("value")) === "true";
  if (!checklistFields.includes(field as typeof checklistFields[number])) return;
  await prisma.clinicLaunchChecklist.upsert({ where: { clinicId: user.clinicId }, create: { clinicId: user.clinicId, [field]: value }, update: { [field]: value } });
  revalidatePath("/dashboard/launch");
}
