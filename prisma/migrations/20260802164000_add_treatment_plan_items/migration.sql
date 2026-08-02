CREATE TABLE "TreatmentPlanItem" (
    "id" SERIAL NOT NULL,
    "treatmentPlanId" INTEGER NOT NULL,
    "serviceId" INTEGER,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreatmentPlanItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TreatmentPlanItem_treatmentPlanId_idx" ON "TreatmentPlanItem"("treatmentPlanId");
CREATE INDEX "TreatmentPlanItem_serviceId_idx" ON "TreatmentPlanItem"("serviceId");
ALTER TABLE "TreatmentPlanItem" ADD CONSTRAINT "TreatmentPlanItem_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES "TreatmentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TreatmentPlanItem" ADD CONSTRAINT "TreatmentPlanItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ClinicService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
