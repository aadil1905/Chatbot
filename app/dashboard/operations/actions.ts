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
  const supplier = String(formData.get("supplier") || "").trim() || null;
  const batchNumber = String(formData.get("batchNumber") || "").trim() || null;
  const expiryValue = String(formData.get("expiryDate") || "");
  if (!name) return;
  await prisma.inventoryItem.upsert({ where: { clinicId_name: { clinicId: user.clinicId, name } }, create: { clinicId: user.clinicId, name, category, unit, quantity, reorderLevel, costPerUnit: cost ? Math.max(0, Number(cost)) : null, supplier, batchNumber, expiryDate: expiryValue ? new Date(expiryValue) : null }, update: { category, unit, quantity, reorderLevel, costPerUnit: cost ? Math.max(0, Number(cost)) : null, supplier, batchNumber, expiryDate: expiryValue ? new Date(expiryValue) : null, active: true } });
  revalidatePath(operationsPath);
}

export async function adjustInventoryAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const adjustment = Math.trunc(Number(formData.get("adjustment")) || 0);
  if (!Number.isInteger(id) || adjustment === 0) return;
  const item = await prisma.inventoryItem.findFirst({ where: { id, clinicId: user.clinicId } });
  if (!item) return;
  const quantityChange = Math.max(-item.quantity, adjustment);
  await prisma.$transaction([
    prisma.inventoryItem.update({ where: { id }, data: { quantity: item.quantity + quantityChange } }),
    prisma.inventoryMovement.create({ data: { inventoryItemId: id, clinicId: user.clinicId, quantityChange, type: "ADJUSTMENT", recordedBy: user.fullName } }),
  ]);
  revalidatePath(operationsPath);
}

export async function recordInventoryUsageAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const quantity = Math.max(1, Math.trunc(Number(formData.get("quantity")) || 0));
  const patientId = Number(formData.get("patientId")) || null;
  const treatmentPlanId = Number(formData.get("treatmentPlanId")) || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const item = Number.isInteger(id) ? await prisma.inventoryItem.findFirst({ where: { id, clinicId: user.clinicId } }) : null;
  if (!item || quantity > item.quantity) return;
  if (patientId && !await prisma.patient.findFirst({ where: { id: patientId, clinicId: user.clinicId }, select: { id: true } })) return;
  await prisma.$transaction([
    prisma.inventoryItem.update({ where: { id }, data: { quantity: item.quantity - quantity } }),
    prisma.inventoryMovement.create({ data: { inventoryItemId: id, clinicId: user.clinicId, quantityChange: -quantity, type: "TREATMENT_USAGE", patientId, treatmentPlanId, notes, recordedBy: user.fullName } }),
  ]);
  revalidatePath(operationsPath);
}

export async function createPurchaseOrderAction(formData: FormData) {
  const user = await requireUser();
  const inventoryItemId = Number(formData.get("inventoryItemId"));
  const quantity = Math.max(1, Math.trunc(Number(formData.get("quantity")) || 0));
  const supplier = String(formData.get("supplier") || "").trim();
  const notes = String(formData.get("notes") || "").trim() || null;
  const item = Number.isInteger(inventoryItemId) ? await prisma.inventoryItem.findFirst({ where: { id: inventoryItemId, clinicId: user.clinicId }, select: { id: true } }) : null;
  if (!item || !supplier) return;
  await prisma.purchaseOrder.create({ data: { clinicId: user.clinicId, supplier, notes, createdBy: user.fullName, items: { create: { inventoryItemId, quantity } } } });
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
