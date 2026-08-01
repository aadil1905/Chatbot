-- Bring the production database in line with the clinical workspace schema.
-- Every change is additive; existing clinic and patient data is preserved.

ALTER TABLE "ClinicalRecord"
  ADD COLUMN IF NOT EXISTS "medicalHistory" TEXT,
  ADD COLUMN IF NOT EXISTS "drugAllergies" TEXT,
  ADD COLUMN IF NOT EXISTS "medications" TEXT,
  ADD COLUMN IF NOT EXISTS "otherHistory" TEXT,
  ADD COLUMN IF NOT EXISTS "bloodPressure" TEXT,
  ADD COLUMN IF NOT EXISTS "weightKg" TEXT,
  ADD COLUMN IF NOT EXISTS "dentalHistory" TEXT,
  ADD COLUMN IF NOT EXISTS "treatmentDone" TEXT,
  ADD COLUMN IF NOT EXISTS "estimateAmount" INTEGER,
  ADD COLUMN IF NOT EXISTS "consentGiven" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "consentNotes" TEXT;

ALTER TABLE "TreatmentPlan"
  ADD COLUMN IF NOT EXISTS "visitDate" TIMESTAMP(3);

ALTER TABLE "DentalChartEntry"
  ADD COLUMN IF NOT EXISTS "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DROP INDEX IF EXISTS "DentalChartEntry_patientId_toothNumber_key";

CREATE UNIQUE INDEX IF NOT EXISTS "DentalChartEntry_patientId_toothNumber_visitDate_key"
  ON "DentalChartEntry"("patientId", "toothNumber", "visitDate");

CREATE INDEX IF NOT EXISTS "DentalChartEntry_patientId_visitDate_idx"
  ON "DentalChartEntry"("patientId", "visitDate");
