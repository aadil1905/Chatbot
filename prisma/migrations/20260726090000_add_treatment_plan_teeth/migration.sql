CREATE TABLE "TreatmentPlanTooth" (
    "id" SERIAL NOT NULL,
    "treatmentPlanId" INTEGER NOT NULL,
    "toothNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreatmentPlanTooth_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TreatmentPlanTooth_treatmentPlanId_toothNumber_key" ON "TreatmentPlanTooth"("treatmentPlanId", "toothNumber");
CREATE INDEX "TreatmentPlanTooth_toothNumber_idx" ON "TreatmentPlanTooth"("toothNumber");

ALTER TABLE "TreatmentPlanTooth" ADD CONSTRAINT "TreatmentPlanTooth_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES "TreatmentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
