"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const operationsPath = "/dashboard/operations";
const labStatuses = ["SENT_TO_LAB", "IN_PROGRESS", "READY", "DELIVERED", "CANCELLED"];

export async function addInventoryItemAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "Clinical supplies").trim();
  const unit = String(formData.get("unit") || "units").trim();
  const quantity = Math.max(0, Number(formData.get("quantity")) || 0);
  const reorderLevel = Math.max(0, Number(formData.get("reorderLevel")) || 0);
  const cost = String(formData.get("costPerUnit") || "").trim();
  if (!name) return;
  await prisma.inventoryItem.upsert({ where: { clinicId_name: { clinicId: user.clinicId, name } }, create: { clinicId: user.clinicId, name, category, unit, quantity, reorderLevel, costPerUnit: cost ? Math.max(0, Number(cost)) : null }, update: { category, unit, quantity, reorderLevel, costPerUnit: cost ? Math.max(0, Number(cost)) : null, active: true } });
  revalidatePath(operationsPath);
}

export async function adjustInventoryAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const adjustment = Math.trunc(Number(formData.get("adjustment")) || 0);
  if (!Number.isInteger(id) || adjustment === 0) return;
  const item = await prisma.inventoryItem.findFirst({ where: { id, clinicId: user.clinicId } });
  if (!item) return;
  await prisma.inventoryItem.update({ where: { id }, data: { quantity: Math.max(0, item.quantity + adjustment) } });
  revalidatePath(operationsPath);
}

export async function addLabCaseAction(formData: FormData) {
  const user = await requireUser();
  const patientId = Number(formData.get("patientId"));
  const treatmentPlanId = Number(formData.get("treatmentPlanId")) || null;
  const labName = String(formData.get("labName") || "").trim();
  const caseType = String(formData.get("caseType") || "").trim();
  const dueDateValue = String(formData.get("dueDate") || "");
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!Number.isInteger(patientId) || !labName || !caseType) return;
  await prisma.labCase.create({ data: { clinicId: user.clinicId, patientId, treatmentPlanId, labName, caseType, dueDate: dueDateValue ? new Date(dueDateValue) : null, notes } });
  revalidatePath(operationsPath);
}

export async function updateLabCaseAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") || "");
  if (!Number.isInteger(id) || !labStatuses.includes(status)) return;
  await prisma.labCase.updateMany({ where: { id, clinicId: user.clinicId }, data: { status } });
  revalidatePath(operationsPath);
}
