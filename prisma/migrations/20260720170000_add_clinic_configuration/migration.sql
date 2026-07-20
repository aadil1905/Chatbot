CREATE TABLE "ClinicService" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "price" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClinicService_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClinicHours" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL DEFAULT '09:00',
    "closeTime" TEXT NOT NULL DEFAULT '18:00',
    "slotMinutes" INTEGER NOT NULL DEFAULT 30,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ClinicHours_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClinicWhatsAppSettings" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "welcomeEnglish" TEXT,
    "welcomeHindi" TEXT,
    "welcomeHinglish" TEXT,
    "welcomeMarathi" TEXT,
    "contactMessage" TEXT,
    "bookingIntro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClinicWhatsAppSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClinicHours_clinicId_dayOfWeek_key" ON "ClinicHours"("clinicId", "dayOfWeek");
CREATE UNIQUE INDEX "ClinicWhatsAppSettings_clinicId_key" ON "ClinicWhatsAppSettings"("clinicId");
CREATE INDEX "ClinicService_clinicId_active_sortOrder_idx" ON "ClinicService"("clinicId", "active", "sortOrder");
ALTER TABLE "ClinicService" ADD CONSTRAINT "ClinicService_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicHours" ADD CONSTRAINT "ClinicHours_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicWhatsAppSettings" ADD CONSTRAINT "ClinicWhatsAppSettings_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
