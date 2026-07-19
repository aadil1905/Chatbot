CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "medicalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Patient_phone_key" ON "Patient"("phone");
CREATE INDEX "Patient_fullName_idx" ON "Patient"("fullName");

INSERT INTO "Patient" ("fullName", "phone", "createdAt", "updatedAt")
SELECT DISTINCT ON ("phone") "patientName", "phone", NOW(), NOW()
FROM "Appointment"
WHERE "phone" IS NOT NULL AND "phone" <> ''
ORDER BY "phone", "createdAt" ASC;

ALTER TABLE "Appointment" ADD COLUMN "patientId" INTEGER;
UPDATE "Appointment" SET "patientId" = "Patient"."id" FROM "Patient" WHERE "Appointment"."phone" = "Patient"."phone";
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
