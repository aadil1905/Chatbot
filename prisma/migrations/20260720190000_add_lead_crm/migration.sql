CREATE TABLE "Lead" (
  "id" SERIAL NOT NULL,
  "clinicId" INTEGER NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "serviceInterest" TEXT,
  "source" TEXT NOT NULL DEFAULT 'WhatsApp',
  "stage" TEXT NOT NULL DEFAULT 'NEW',
  "notes" TEXT,
  "lossReason" TEXT,
  "lastContactedAt" TIMESTAMP(3),
  "nextFollowUpAt" TIMESTAMP(3),
  "bookedAppointmentId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadActivity" (
  "id" SERIAL NOT NULL,
  "leadId" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "content" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lead_bookedAppointmentId_key" ON "Lead"("bookedAppointmentId");
CREATE UNIQUE INDEX "Lead_clinicId_phone_key" ON "Lead"("clinicId", "phone");
CREATE INDEX "Lead_clinicId_stage_createdAt_idx" ON "Lead"("clinicId", "stage", "createdAt");
CREATE INDEX "Lead_clinicId_nextFollowUpAt_idx" ON "Lead"("clinicId", "nextFollowUpAt");
CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_bookedAppointmentId_fkey" FOREIGN KEY ("bookedAppointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
