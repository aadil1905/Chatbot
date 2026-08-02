ALTER TABLE "Lead" ADD COLUMN "ownerId" INTEGER;

CREATE INDEX "Lead_clinicId_ownerId_nextFollowUpAt_idx"
ON "Lead"("clinicId", "ownerId", "nextFollowUpAt");

ALTER TABLE "Lead"
ADD CONSTRAINT "Lead_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
