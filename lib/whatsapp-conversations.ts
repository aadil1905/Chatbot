import { prisma } from "@/lib/prisma";

async function primaryClinic() {
  return prisma.clinic.findFirst({ orderBy: { id: "asc" } });
}

export async function getConversation(phone: string) {
  const clinic = await primaryClinic();
  if (!clinic) throw new Error("No clinic has been configured yet.");
  return prisma.whatsAppConversation.upsert({
    where: { clinicId_phone: { clinicId: clinic.id, phone } },
    create: { clinicId: clinic.id, phone },
    update: { lastMessageAt: new Date() },
  });
}

export async function recordInboundMessage(phone: string, content: string, messageType = "TEXT") {
  const conversation = await getConversation(phone);
  await prisma.$transaction([
    prisma.whatsAppMessage.create({ data: { conversationId: conversation.id, direction: "INBOUND", content, messageType } }),
    prisma.lead.upsert({
      where: { clinicId_phone: { clinicId: conversation.clinicId, phone } },
      create: { clinicId: conversation.clinicId, phone, fullName: `WhatsApp lead ${phone.slice(-4)}`, source: "WhatsApp", activities: { create: { type: "WHATSAPP_ENQUIRY", content: "New WhatsApp conversation started" } } },
      update: {},
    }),
  ]);
  return conversation;
}

export async function recordOutboundMessage(phone: string, content: string, messageType = "TEXT") {
  const conversation = await getConversation(phone);
  await prisma.whatsAppMessage.create({ data: { conversationId: conversation.id, direction: "OUTBOUND", content, messageType } });
}

export async function getRecentConversationMessages(phone: string) {
  const conversation = await getConversation(phone);
  return prisma.whatsAppMessage.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: "desc" }, take: 18 });
}

export async function setConversationLanguage(phone: string, language: string | null) {
  const conversation = await getConversation(phone);
  await prisma.whatsAppConversation.update({ where: { id: conversation.id }, data: { language } });
}

export async function getBooking(phone: string) {
  const conversation = await getConversation(phone);
  return prisma.whatsAppBooking.findUnique({ where: { conversationId: conversation.id } });
}

export async function startPersistentBooking(phone: string) {
  const conversation = await getConversation(phone);
  return prisma.whatsAppBooking.upsert({ where: { conversationId: conversation.id }, create: { conversationId: conversation.id }, update: { step: "name", patientName: "", phone: "", appointmentDate: "", appointmentTime: "", reason: "" } });
}

export async function updateBooking(phone: string, data: Record<string, string>) {
  const conversation = await getConversation(phone);
  return prisma.whatsAppBooking.update({ where: { conversationId: conversation.id }, data });
}

export async function clearPersistentBooking(phone: string) {
  const conversation = await getConversation(phone);
  await prisma.whatsAppBooking.deleteMany({ where: { conversationId: conversation.id } });
}

export async function markLeadBooked(phone: string, appointmentId: number, fullName: string) {
  const conversation = await getConversation(phone);
  await prisma.lead.updateMany({ where: { clinicId: conversation.clinicId, phone }, data: { fullName, stage: "BOOKED", bookedAppointmentId: appointmentId, lastContactedAt: new Date() } });
}
