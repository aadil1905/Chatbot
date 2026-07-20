"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

const path = "/dashboard/ai-coach";

export async function addFaqAction(formData: FormData) {
  const owner = await requireOwner();
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  if (!question || !answer) return;
  await prisma.clinicFAQ.create({ data: { clinicId: owner.clinicId, question, answer, category: String(formData.get("category") || "GENERAL") } });
  revalidatePath(path);
}

export async function toggleFaqAction(formData: FormData) {
  const owner = await requireOwner();
  const id = Number(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  if (Number.isInteger(id)) await prisma.clinicFAQ.updateMany({ where: { id, clinicId: owner.clinicId }, data: { active } });
  revalidatePath(path);
}
