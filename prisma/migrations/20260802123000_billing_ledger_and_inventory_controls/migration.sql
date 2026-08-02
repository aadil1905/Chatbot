ALTER TABLE "Payment" ADD COLUMN "recordedBy" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN "supplier" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN "batchNumber" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN "expiryDate" TIMESTAMP(3);
CREATE INDEX "InventoryItem_clinicId_expiryDate_idx" ON "InventoryItem"("clinicId", "expiryDate");
