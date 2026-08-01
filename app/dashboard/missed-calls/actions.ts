"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTemplateMessage, sendTextMessage } from "@/lib/whatsapp";

const missedCallsPath = "/dashboard/missed-calls";
const missedCallType = "MISSED_CALL";

function cleanPhone(value: FormDataEntryValue | null) {
  return String(value || "").replace(/\D/g, "");
}

function patientName(value: string | null | undefined) {
  const name = value?.trim();
  return name || "there";
}

function followUpMessage(name: string | null | undefined) {
  return `Hi ${patientName(name)}, this is Dr. Deepika's Dental White. We noticed you tried contacting the clinic. Would you like to book an appointment? Please reply here to continue.`;
}

async function sendMissedCallMessage(phone: string, name?: string | null) {
  const templateName = process.env.WHATSAPP_MISSED_CALL_TEMPLATE || "clinic_follow_up";
  const templateLanguage = process.env.WHATSAPP_MISSED_CALL_TEMPLATE_LANG || "en";

  if (process.env.WHATSAPP_MISSED_CALL_TEMPLATE) {
    return sendTemplateMessage(phone, templateName, templateLanguage, [patientName(name)]);
  }

  return sendTextMessage(phone, followUpMessage(name));
}

export async function addMissedCallAction(formData: FormData) {
  const user = await requireUser();
  const phone = cleanPhone(formData.get("phone"));
  const callerName = String(formData.get("callerName") || "").trim() || `Missed call ${phone.slice(-4)}`;
  const notes = String(formData.get("notes") || "").trim();
  const callReceivedAtValue = String(formData.get("callReceivedAt") || "");
  const callReceivedAt = callReceivedAtValue ? new Date(callReceivedAtValue) : new Date();

  if (phone.length < 10) return;

  await prisma.followUpTask.create({
    data: {
      clinicId: user.clinicId,
      patientName: callerName,
      phone,
      taskType: missedCallType,
      status: "PENDING",
      message: notes ? `${followUpMessage(callerName)}\n\nStaff note: ${notes}` : followUpMessage(callerName),
      scheduledFor: Number.isNaN(callReceivedAt.getTime()) ? new Date() : callReceivedAt,
    },
  });

  revalidatePath(missedCallsPath);
}

export async function sendMissedCallAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const missedCall = await prisma.followUpTask.findFirst({ where: { id, clinicId: user.clinicId, taskType: missedCallType } });
  if (!missedCall || missedCall.status === "SENT") return;

  try {
    await sendMissedCallMessage(missedCall.phone, missedCall.patientName);
    await prisma.followUpTask.update({
      where: { id: missedCall.id },
      data: { status: "SENT", sentAt: new Date(), errorMessage: null },
    });
  } catch (error) {
    await prisma.followUpTask.update({
      where: { id: missedCall.id },
      data: { status: "FAILED", errorMessage: error instanceof Error ? error.message : "Unable to send WhatsApp message" },
    });
  }

  revalidatePath(missedCallsPath);
}

export async function sendAllPendingMissedCallsAction() {
  const user = await requireUser();
  const missedCalls = await prisma.followUpTask.findMany({
    where: { clinicId: user.clinicId, taskType: missedCallType, status: { in: ["PENDING", "FAILED"] } },
    orderBy: { scheduledFor: "desc" },
    take: 100,
  });

  for (const missedCall of missedCalls) {
    try {
      await sendMissedCallMessage(missedCall.phone, missedCall.patientName);
      await prisma.followUpTask.update({
        where: { id: missedCall.id },
        data: { status: "SENT", sentAt: new Date(), errorMessage: null },
      });
    } catch (error) {
      await prisma.followUpTask.update({
        where: { id: missedCall.id },
        data: { status: "FAILED", errorMessage: error instanceof Error ? error.message : "Unable to send WhatsApp message" },
      });
    }
  }

  revalidatePath(missedCallsPath);
}

export async function markMissedCallContactedAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  await prisma.followUpTask.updateMany({
    where: { id, clinicId: user.clinicId, taskType: missedCallType },
    data: { status: "COMPLETED", completedAt: new Date(), errorMessage: null },
  });
  revalidatePath(missedCallsPath);
}

export async function deleteMissedCallAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  await prisma.followUpTask.deleteMany({ where: { id, clinicId: user.clinicId, taskType: missedCallType } });
  revalidatePath(missedCallsPath);
}
