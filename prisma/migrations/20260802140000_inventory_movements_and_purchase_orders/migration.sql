CREATE TABLE "InventoryMovement" (
  "id" SERIAL NOT NULL,
  "inventoryItemId" INTEGER NOT NULL,
  "clinicId" INTEGER NOT NULL,
  "quantityChange" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "notes" TEXT,
  "patientId" INTEGER,
  "treatmentPlanId" INTEGER,
  "recordedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InventoryMovement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "InventoryMovement_clinicId_createdAt_idx" ON "InventoryMovement"("clinicId", "createdAt");
CREATE INDEX "InventoryMovement_inventoryItemId_createdAt_idx" ON "InventoryMovement"("inventoryItemId", "createdAt");
CREATE TABLE "PurchaseOrder" (
  "id" SERIAL NOT NULL, "clinicId" INTEGER NOT NULL, "supplier" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'DRAFT', "notes" TEXT, "createdBy" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PurchaseOrder_clinicId_status_createdAt_idx" ON "PurchaseOrder"("clinicId", "status", "createdAt");
CREATE TABLE "PurchaseOrderItem" (
  "id" SERIAL NOT NULL, "purchaseOrderId" INTEGER NOT NULL, "inventoryItemId" INTEGER NOT NULL, "quantity" INTEGER NOT NULL,
  CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PurchaseOrderItem_purchaseOrderId_inventoryItemId_key" UNIQUE ("purchaseOrderId", "inventoryItemId"),
  CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PurchaseOrderItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
