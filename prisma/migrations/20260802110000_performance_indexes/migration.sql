-- Dashboard and list views filter within a clinic and then sort or aggregate by date.
-- These indexes prevent table scans as the clinic history grows.
CREATE INDEX "Appointment_clinicId_status_appointmentDate_appointmentTime_idx"
  ON "Appointment"("clinicId", "status", "appointmentDate", "appointmentTime");

CREATE INDEX "Patient_clinicId_createdAt_idx"
  ON "Patient"("clinicId", "createdAt");
