INSERT INTO "ClinicService" ("clinicId", "name", "description", "durationMinutes", "sortOrder", "active", "createdAt", "updatedAt")
SELECT c."id", 'X-Ray', 'Dental X-Ray imaging and review', 20, 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Clinic" c
WHERE NOT EXISTS (
  SELECT 1 FROM "ClinicService" s WHERE s."clinicId" = c."id" AND s."name" = 'X-Ray'
);
