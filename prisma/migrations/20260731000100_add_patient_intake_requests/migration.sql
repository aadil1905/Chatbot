CREATE TABLE IF NOT EXISTS "PatientIntakeRequest" (
  "id" SERIAL NOT NULL,
  "clinicId" INTEGER NOT NULL,
  "patientId" INTEGER NOT NULL,
  "token" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'CREATED',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "sentAt" TIMESTAMP(3),
  "openedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "medicalHistory" TEXT,
  "drugAllergies" TEXT,
  "medications" TEXT,
  "otherHistory" TEXT,
  "bloodPressure" TEXT,
  "weightKg" TEXT,
  "dentalHistory" TEXT,
  "consentGiven" BOOLEAN NOT NULL DEFAULT false,
  "consentNotes" TEXT,
  "patientSignature" TEXT,
  "guardianSignature" TEXT,
  "treatmentDone" TEXT,
  "estimateAmount" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PatientIntakeRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PatientIntakeRequest_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PatientIntakeRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "PatientIntakeRequest_token_key" ON "PatientIntakeRequest"("token");
CREATE INDEX IF NOT EXISTS "PatientIntakeRequest_clinicId_status_createdAt_idx" ON "PatientIntakeRequest"("clinicId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "PatientIntakeRequest_patientId_createdAt_idx" ON "PatientIntakeRequest"("patientId", "createdAt");
CREATE INDEX IF NOT EXISTS "PatientIntakeRequest_expiresAt_idx" ON "PatientIntakeRequest"("expiresAt");
