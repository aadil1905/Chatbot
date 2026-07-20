CREATE TABLE "DentalChartEntry" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "toothNumber" TEXT NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'HEALTHY',
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DentalChartEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DentalChartEntry_patientId_toothNumber_key" ON "DentalChartEntry"("patientId", "toothNumber");
CREATE INDEX "DentalChartEntry_patientId_condition_idx" ON "DentalChartEntry"("patientId", "condition");
ALTER TABLE "DentalChartEntry" ADD CONSTRAINT "DentalChartEntry_patientId_fkey"
  FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
