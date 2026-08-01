-- Assign legacy rows to the original clinic before enforcing tenant ownership.
ALTER TABLE "Appointment" ADD COLUMN "clinicId" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Patient" ADD COLUMN "clinicId" INTEGER;

UPDATE "Appointment"
SET "clinicId" = (SELECT "id" FROM "Clinic" ORDER BY "id" ASC LIMIT 1)
WHERE "clinicId" IS NULL;

UPDATE "Patient"
SET "clinicId" = COALESCE(
  (
    SELECT a."clinicId"
    FROM "Appointment" a
    WHERE a."patientId" = "Patient"."id"
    ORDER BY a."createdAt" ASC
    LIMIT 1
  ),
  (SELECT "id" FROM "Clinic" ORDER BY "id" ASC LIMIT 1)
)
WHERE "clinicId" IS NULL;

ALTER TABLE "Appointment" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Patient" ALTER COLUMN "clinicId" SET NOT NULL;

DROP INDEX IF EXISTS "Patient_phone_key";
CREATE UNIQUE INDEX "Patient_clinicId_phone_key" ON "Patient"("clinicId", "phone");
CREATE INDEX "Patient_clinicId_fullName_idx" ON "Patient"("clinicId", "fullName");
CREATE INDEX "Appointment_clinicId_archivedAt_appointmentDate_idx"
  ON "Appointment"("clinicId", "archivedAt", "appointmentDate");

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_clinicId_fkey"
FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Patient"
ADD CONSTRAINT "Patient_clinicId_fkey"
FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
