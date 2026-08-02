ALTER TABLE "WhatsAppConversation" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'OPEN';
ALTER TABLE "WhatsAppConversation" ADD COLUMN "label" TEXT;
ALTER TABLE "WhatsAppConversation" ADD COLUMN "assignedUserId" INTEGER;
CREATE INDEX "WhatsAppConversation_clinicId_status_assignedUserId_idx" ON "WhatsAppConversation"("clinicId", "status", "assignedUserId");
ALTER TABLE "WhatsAppConversation" ADD CONSTRAINT "WhatsAppConversation_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
