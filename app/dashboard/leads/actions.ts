"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const leadsPath = "/dashboard/leads";
const stages = ["NEW", "CONTACTED", "BOOKED", "VISITED", "CONVERTED", "LOST"];

export async function saveLeadAction(formData: FormData) {
  const user = await requireUser();
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").replace(/\D/g, "");
  if (!fullName || phone.length < 10) return;
  const source = String(formData.get("source") || "Manual");
  const serviceInterest = String(formData.get("serviceInterest") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const email = String(formData.get("email") || "").trim().toLowerCase() || null;
  const lead = await prisma.lead.upsert({
    where: { clinicId_phone: { clinicId: user.clinicId, phone } },
    create: { clinicId: user.clinicId, fullName, phone, email, source, serviceInterest, notes, activities: { create: { type: "LEAD_CREATED", content: `Lead added from ${source}` } } },
    update: { fullName, email, source, serviceInterest, notes },
  });
  await prisma.leadActivity.create({ data: { leadId: lead.id, type: "LEAD_UPDATED", content: "Lead details updated" } });
  revalidatePath(leadsPath);
}

export async function updateLeadAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const stage = String(formData.get("stage") || "NEW");
  if (!Number.isInteger(id) || !stages.includes(stage)) return;
  const lossReason = String(formData.get("lossReason") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const followUp = String(formData.get("nextFollowUpAt") || "");
  const nextFollowUpAt = followUp ? new Date(followUp) : null;
  const conversionValueInput = String(formData.get("conversionValue") || "").trim();
  const conversionValueNumber = Number(conversionValueInput);
  const existing = await prisma.lead.findFirst({ where: { id, clinicId: user.clinicId }, select: { stage: true } });
  if (!existing) return;
  const contactStages = ["CONTACTED", "BOOKED", "VISITED", "CONVERTED"];
  const recovered = existing.stage === "LOST" && stage !== "LOST";
  const result = await prisma.lead.updateMany({ where: { id, clinicId: user.clinicId }, data: { stage, lossReason: stage === "LOST" ? lossReason : null, notes, nextFollowUpAt, lastContactedAt: contactStages.includes(stage) ? new Date() : undefined, recoveredAt: recovered ? new Date() : undefined, conversionValue: stage === "CONVERTED" && Number.isFinite(conversionValueNumber) && conversionValueNumber >= 0 ? Math.round(conversionValueNumber) : undefined } });
  if (result.count) {
    await prisma.leadActivity.create({ data: { leadId: id, type: "STAGE_CHANGED", content: `Lead moved to ${stage}` } });
    if (recovered) await prisma.leadActivity.create({ data: { leadId: id, type: "LEAD_RECOVERED", content: "Lead was recovered from Lost" } });
  }
  revalidatePath(leadsPath);
}
