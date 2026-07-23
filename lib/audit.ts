import "server-only";

import { prisma } from "@/lib/prisma";

type AuditEntry = {
  clinicId: number;
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  detail?: string | null;
};

export async function recordAudit(entry: AuditEntry) {
  return prisma.auditLog.create({ data: entry });
}
