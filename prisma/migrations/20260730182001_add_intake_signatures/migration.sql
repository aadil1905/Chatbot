-- Store signatures captured by the paperless patient-intake workflow.
ALTER TABLE "ClinicalRecord"
  ADD COLUMN IF NOT EXISTS "patientSignature" TEXT,
  ADD COLUMN IF NOT EXISTS "guardianSignature" TEXT,
  ADD COLUMN IF NOT EXISTS "consentSignedAt" TIMESTAMP(3);
