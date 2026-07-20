ALTER TABLE "Lead" ADD COLUMN "conversionValue" INTEGER;
ALTER TABLE "Lead" ADD COLUMN "recoveredAt" TIMESTAMP(3);

CREATE INDEX "Lead_clinicId_recoveredAt_idx" ON "Lead"("clinicId", "recoveredAt");
