-- DentalAI v1.0 clinical workflow upgrade
ALTER TABLE "TreatmentPlan" ADD COLUMN "serviceId" INTEGER;
ALTER TABLE "TreatmentPlan" ADD COLUMN "toothNumber" TEXT;
ALTER TABLE "TreatmentPlan" ADD COLUMN "unitPrice" INTEGER;

CREATE TABLE "Prescription" (
  "id" SERIAL NOT NULL,
  "patientId" INTEGER NOT NULL,
  "clinicalRecordId" INTEGER,
  "prescribedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "diagnosis" TEXT,
  "instructions" TEXT,
  "medicines" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Prescription_patientId_prescribedOn_idx" ON "Prescription"("patientId", "prescribedOn");
CREATE INDEX "TreatmentPlan_serviceId_idx" ON "TreatmentPlan"("serviceId");
ALTER TABLE "TreatmentPlan" ADD CONSTRAINT "TreatmentPlan_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ClinicService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
