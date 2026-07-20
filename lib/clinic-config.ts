import { prisma } from "@/lib/prisma";

export const defaultServices = [
  { name: "Dental consultation", description: "Discuss a dental concern with the dentist", durationMinutes: 30, sortOrder: 1 },
  { name: "Dental cleaning", description: "Routine scaling and cleaning visit", durationMinutes: 45, sortOrder: 2 },
  { name: "Root canal consultation", description: "Assessment and treatment planning", durationMinutes: 30, sortOrder: 3 },
  { name: "Follow-up visit", description: "Review after a previous dental visit", durationMinutes: 20, sortOrder: 4 },
];

export const defaultHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  openTime: "09:00",
  closeTime: "18:00",
  slotMinutes: 30,
  isClosed: dayOfWeek === 0,
}));

export async function getClinicConfiguration() {
  return prisma.clinic.findFirst({
    include: {
      services: { where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      hours: { orderBy: { dayOfWeek: "asc" } },
      whatsapp: true,
    },
  });
}

export function buildTimeSlots(openTime: string, closeTime: string, slotMinutes: number) {
  const [openHour, openMinute] = openTime.split(":").map(Number);
  const [closeHour, closeMinute] = closeTime.split(":").map(Number);
  let current = openHour * 60 + openMinute;
  const closing = closeHour * 60 + closeMinute;
  const slots: string[] = [];
  while (current < closing && slots.length < 10) {
    const hour = String(Math.floor(current / 60)).padStart(2, "0");
    const minute = String(current % 60).padStart(2, "0");
    slots.push(`${hour}:${minute}`);
    current += Math.max(15, slotMinutes);
  }
  return slots;
}
