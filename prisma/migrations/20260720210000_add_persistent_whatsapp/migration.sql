CREATE TABLE "WhatsAppConversation" (
  "id" SERIAL NOT NULL,
  "clinicId" INTEGER NOT NULL,
  "phone" TEXT NOT NULL,
  "language" TEXT,
  "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WhatsAppConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WhatsAppMessage" (
  "id" SERIAL NOT NULL,
  "conversationId" INTEGER NOT NULL,
  "direction" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "messageType" TEXT NOT NULL DEFAULT 'TEXT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WhatsAppBooking" (
  "id" SERIAL NOT NULL,
  "conversationId" INTEGER NOT NULL,
  "step" TEXT NOT NULL DEFAULT 'name',
  "patientName" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "appointmentDate" TEXT NOT NULL DEFAULT '',
  "appointmentTime" TEXT NOT NULL DEFAULT '',
  "reason" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WhatsAppBooking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WhatsAppConversation_clinicId_phone_key" ON "WhatsAppConversation"("clinicId", "phone");
CREATE INDEX "WhatsAppConversation_clinicId_lastMessageAt_idx" ON "WhatsAppConversation"("clinicId", "lastMessageAt");
CREATE INDEX "WhatsAppMessage_conversationId_createdAt_idx" ON "WhatsAppMessage"("conversationId", "createdAt");
CREATE UNIQUE INDEX "WhatsAppBooking_conversationId_key" ON "WhatsAppBooking"("conversationId");
CREATE INDEX "WhatsAppBooking_updatedAt_idx" ON "WhatsAppBooking"("updatedAt");
ALTER TABLE "WhatsAppConversation" ADD CONSTRAINT "WhatsAppConversation_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsAppConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WhatsAppBooking" ADD CONSTRAINT "WhatsAppBooking_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsAppConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
