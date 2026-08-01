"use server";

import { revalidatePath } from "next/cache";
import { requireUser, requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getId(formData: FormData) {
  const id = Number(formData.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function deleteServiceAction(formData: FormData) {
  const owner = await requireOwner();
  const id = getId(formData);
  if (!id) return;

  await prisma.clinicService.deleteMany({ where: { id, clinicId: owner.clinicId } });
  revalidatePath("/dashboard/settings/operations");
}

export async function deleteInventoryItemAction(formData: FormData) {
  const user = await requireUser();
  const id = getId(formData);
  if (!id) return;

  await prisma.inventoryItem.deleteMany({ where: { id, clinicId: user.clinicId } });
  revalidatePath("/dashboard/operations");
}

export async function deleteLabCaseAction(formData: FormData) {
  const user = await requireUser();
  const id = getId(formData);
  if (!id) return;

  await prisma.labCase.deleteMany({ where: { id, clinicId: user.clinicId } });
  revalidatePath("/dashboard/operations");
}

export async function deleteLeadAction(formData: FormData) {
  const user = await requireUser();
  const id = getId(formData);
  if (!id) return;

  await prisma.lead.deleteMany({ where: { id, clinicId: user.clinicId } });
  revalidatePath("/dashboard/leads");
}

export async function deletePatientAction(formData: FormData) {
  await requireUser();
  const id = getId(formData);
  if (!id) return;

  await prisma.patient.deleteMany({ where: { id } });
  revalidatePath("/dashboard/patients");
}

export async function deleteConversationAction(formData: FormData) {
  const user = await requireUser();
  const id = getId(formData);
  if (!id) return;

  await prisma.whatsAppConversation.deleteMany({ where: { id, clinicId: user.clinicId } });
  revalidatePath("/dashboard/conversations");
}

export async function deleteFollowUpAction(formData: FormData) {
  const user = await requireUser();
  const id = getId(formData);
  if (!id) return;

  await prisma.followUpTask.deleteMany({ where: { id, clinicId: user.clinicId } });
  revalidatePath("/dashboard/follow-ups");
}

export async function deleteClinicalRecordAction(formData: FormData) {
  await requireUser();
  const id = getId(formData);
  if (!id) return;

  await prisma.clinicalRecord.deleteMany({ where: { id } });
  revalidatePath("/dashboard/clinical-records");
}

export async function deleteTreatmentPlanAction(formData: FormData) {
  await requireUser();
  const id = getId(formData);
  if (!id) return;

  await prisma.treatmentPlan.deleteMany({ where: { id } });
  revalidatePath("/dashboard/treatment-plans");
}

export async function deleteInvoiceAction(formData: FormData) {
  await requireUser();
  const id = getId(formData);
  if (!id) return;

  await prisma.invoice.deleteMany({ where: { id } });
  revalidatePath("/dashboard/billing");
}
