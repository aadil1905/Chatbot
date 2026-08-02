"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export async function updateConversationAction(formData: FormData) {
  const user = await requirePermission("manageSchedule");
  const id = Number(formData.get("id"));
  const assignedUserId = Number(formData.get("assignedUserId")) || null;
  const status = String(formData.get("status") || "OPEN");
  const label = String(formData.get("label") || "").trim() || null;
  if (!Number.isInteger(id) || !["OPEN", "RESOLVED"].includes(status)) return;
  if (assignedUserId) {
    const assignee = await prisma.user.findFirst({ where: { id: assignedUserId, clinicId: user.clinicId, active: true }, select: { id: true } });
    if (!assignee) return;
  }
  await prisma.whatsAppConversation.updateMany({ where: { id, clinicId: user.clinicId }, data: { assignedUserId, status, label } });
  revalidatePath("/dashboard/conversations");
}
