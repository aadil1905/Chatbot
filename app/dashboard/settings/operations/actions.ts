"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

const operationsPath = "/dashboard/settings/operations";

export async function addServiceAction(formData: FormData) {
  const owner = await requireOwner();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const durationMinutes = Math.max(15, Number(formData.get("durationMinutes")) || 30);
  const rawPrice = String(formData.get("price") || "").trim();
  await prisma.clinicService.create({ data: {
    clinicId: owner.clinicId, name,
    description: String(formData.get("description") || "").trim() || null,
    durationMinutes, price: rawPrice ? Number(rawPrice) : null,
    sortOrder: Number(formData.get("sortOrder")) || 0,
  }});
  revalidatePath(operationsPath);
}

export async function toggleServiceAction(formData: FormData) {
  const owner = await requireOwner();
  const id = Number(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  if (Number.isInteger(id)) await prisma.clinicService.updateMany({ where: { id, clinicId: owner.clinicId }, data: { active } });
  revalidatePath(operationsPath);
}

export async function updateServiceAction(formData: FormData) {
  const owner = await requireOwner();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const rawPrice = String(formData.get("price") || "").trim();
  if (!Number.isInteger(id) || !name) return;

  await prisma.clinicService.updateMany({
    where: { id, clinicId: owner.clinicId },
    data: {
      name,
      description: String(formData.get("description") || "").trim() || null,
      durationMinutes: Math.max(15, Number(formData.get("durationMinutes")) || 30),
      price: rawPrice ? Number(rawPrice) : null,
    },
  });
  revalidatePath(operationsPath);
}

export async function saveHoursAction(formData: FormData) {
  const owner = await requireOwner();
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) return;
  const openTime = String(formData.get("openTime") || "09:00");
  const closeTime = String(formData.get("closeTime") || "18:00");
  const slotMinutes = Math.max(15, Number(formData.get("slotMinutes")) || 30);
  const isClosed = String(formData.get("isClosed")) === "true";
  await prisma.clinicHours.upsert({ where: { clinicId_dayOfWeek: { clinicId: owner.clinicId, dayOfWeek } }, create: { clinicId: owner.clinicId, dayOfWeek, openTime, closeTime, slotMinutes, isClosed }, update: { openTime, closeTime, slotMinutes, isClosed } });
  revalidatePath(operationsPath);
}

export async function saveWhatsAppCopyAction(formData: FormData) {
  const owner = await requireOwner();
  await prisma.clinicWhatsAppSettings.upsert({ where: { clinicId: owner.clinicId }, create: {
    clinicId: owner.clinicId,
    welcomeEnglish: String(formData.get("welcomeEnglish") || "").trim() || null,
    welcomeHindi: String(formData.get("welcomeHindi") || "").trim() || null,
    welcomeMarathi: String(formData.get("welcomeMarathi") || "").trim() || null,
    bookingIntro: String(formData.get("bookingIntro") || "").trim() || null,
    contactMessage: String(formData.get("contactMessage") || "").trim() || null,
  }, update: {
    welcomeEnglish: String(formData.get("welcomeEnglish") || "").trim() || null,
    welcomeHindi: String(formData.get("welcomeHindi") || "").trim() || null,
    welcomeMarathi: String(formData.get("welcomeMarathi") || "").trim() || null,
    bookingIntro: String(formData.get("bookingIntro") || "").trim() || null,
    contactMessage: String(formData.get("contactMessage") || "").trim() || null,
  }});
  revalidatePath(operationsPath);
}
