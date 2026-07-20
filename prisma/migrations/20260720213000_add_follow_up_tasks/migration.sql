CREATE TABLE "FollowUpTask" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "leadId" INTEGER,
    "patientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FollowUpTask_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FollowUpTask" ADD CONSTRAINT "FollowUpTask_clinicId_fkey"
  FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FollowUpTask" ADD CONSTRAINT "FollowUpTask_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "FollowUpTask_clinicId_status_scheduledFor_idx" ON "FollowUpTask"("clinicId", "status", "scheduledFor");
CREATE INDEX "FollowUpTask_leadId_idx" ON "FollowUpTask"("leadId");
