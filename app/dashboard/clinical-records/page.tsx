export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import DeleteSubmitButton from "@/components/dashboard/DeleteSubmitButton";
import { deleteClinicalRecordAction } from "@/app/dashboard/delete-actions";

export default async function ClinicalRecordsPage() {
  const records = await prisma.clinicalRecord.findMany({
    include: { patient: true },
    orderBy: { visitDate: "desc" },
    take: 30,
  });

  return (
    <div className="dashboard-list-page mx-auto max-w-7xl space-y-6">
      <header className="dashboard-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clinical records</h1>
          <p className="mt-1 text-muted-foreground">Visits, diagnoses, and examination notes.</p>
        </div>
        <Link href="/dashboard/clinical-records/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          <Plus className="size-4" /> New record
        </Link>
      </header>

      <Card>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">No clinical records yet.</div>
          ) : (
            <div className="divide-y">
              {records.map((record) => (
                <article key={record.id} className="flex flex-col gap-3 p-5 hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between">
                  <Link href={`/dashboard/patients/${record.patientId}`} className="min-w-0 flex-1">
                    <p className="font-semibold">{record.patient.fullName}</p>
                    <p className="mt-1 text-sm">{record.chiefComplaint}</p>
                    {record.diagnosis && <p className="mt-1 text-sm text-muted-foreground">Diagnosis: {record.diagnosis}</p>}
                  </Link>
                  <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
                    <p className="text-sm text-muted-foreground">{record.visitDate.toLocaleDateString()}</p>
                    <form action={deleteClinicalRecordAction}>
                      <input type="hidden" name="id" value={record.id} />
                      <DeleteSubmitButton confirmMessage={`Delete clinical record for ${record.patient.fullName}?`} />
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
