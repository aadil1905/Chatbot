CREATE TABLE "ClinicFAQ" (
  "id" SERIAL NOT NULL,
  "clinicId" INTEGER NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'GENERAL',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicFAQ_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClinicFAQ_clinicId_active_sortOrder_idx" ON "ClinicFAQ"("clinicId", "active", "sortOrder");
ALTER TABLE "ClinicFAQ" ADD CONSTRAINT "ClinicFAQ_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
