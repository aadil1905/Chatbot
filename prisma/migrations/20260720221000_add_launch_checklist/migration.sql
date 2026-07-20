CREATE TABLE "ClinicLaunchChecklist" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "whatsappWebhookVerified" BOOLEAN NOT NULL DEFAULT false,
    "whatsappTemplatesApproved" BOOLEAN NOT NULL DEFAULT false,
    "backupOwnerAssigned" BOOLEAN NOT NULL DEFAULT false,
    "clinicTeamTrained" BOOLEAN NOT NULL DEFAULT false,
    "backupPlanReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClinicLaunchChecklist_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClinicLaunchChecklist_clinicId_key" ON "ClinicLaunchChecklist"("clinicId");
ALTER TABLE "ClinicLaunchChecklist" ADD CONSTRAINT "ClinicLaunchChecklist_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
