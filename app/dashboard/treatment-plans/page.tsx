export const dynamic = "force-dynamic";

import Link from "next/link";
import { CheckCircle2, Clock3, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import DeleteSubmitButton from "@/components/dashboard/DeleteSubmitButton";
import { deleteTreatmentPlanAction } from "@/app/dashboard/delete-actions";
import { requirePermission } from "@/lib/permissions";

export default async function TreatmentPlansPage() {
  const user = await requirePermission("manageClinical");
  const plans = await prisma.treatmentPlan.findMany({
    where: { patient: { clinicId: user.clinicId } },
    select: {
      id: true,
      patientId: true,
      title: true,
      status: true,
      estimatedCost: true,
      updatedAt: true,
      patient: { select: { fullName: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });
  const proposed = plans.filter((plan) => plan.status === "Proposed");
  const accepted = plans.filter((plan) => ["Accepted", "In Progress"].includes(plan.status));
  const proposedValue = proposed.reduce((sum, plan) => sum + (plan.estimatedCost ?? 0), 0);

  return (
    <div className="dashboard-list-page mx-auto max-w-7xl space-y-6">
      <header className="dashboard-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Clinical to cash</p>
          <h1 className="mt-2 text-3xl font-bold">Treatment plans</h1>
          <p className="mt-1 text-muted-foreground">Track acceptance and turn agreed clinical care into invoices from the patient workspace.</p>
        </div>
        <Link href="/dashboard/treatment-plans/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          <Plus className="size-4" /> New plan
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-5"><p className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4 text-amber-600" /> Awaiting acceptance</p><p className="mt-1 text-2xl font-bold">{proposed.length}</p><p className="mt-1 text-xs text-muted-foreground">₹{proposedValue.toLocaleString("en-IN")} proposed value</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-emerald-600" /> Accepted / active</p><p className="mt-1 text-2xl font-bold text-emerald-700">{accepted.length}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Workflow</p><p className="mt-1 text-sm font-semibold">Accept plan → create invoice → collect payment</p></CardContent></Card>
      </section>

      <Card>
        <CardContent className="p-0">
          {plans.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">No treatment plans yet.</div>
          ) : (
            <div className="divide-y">
              {plans.map((plan) => (
                <article key={plan.id} className="flex flex-col gap-3 p-5 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={`/dashboard/patients/${plan.patientId}`} className="min-w-0 flex-1">
                    <p className="font-semibold">{plan.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.patient.fullName} · {plan.status}</p>
                  </Link>
                  <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end sm:text-right">
                    <div className="text-sm">
                      {plan.estimatedCost !== null && <p>₹{plan.estimatedCost.toLocaleString("en-IN")}</p>}
                      <p className="text-muted-foreground">Updated {plan.updatedAt.toLocaleDateString()}</p>
                    </div>
                    <form action={deleteTreatmentPlanAction}>
                      <input type="hidden" name="id" value={plan.id} />
                      <DeleteSubmitButton confirmMessage={`Delete treatment plan ${plan.title}?`} />
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
