export const dynamic = "force-dynamic";

import { AlertTriangle, CalendarClock, FlaskConical, PackageCheck, Plus, Truck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DeleteSubmitButton from "@/components/dashboard/DeleteSubmitButton";
import PendingSubmitButton from "@/components/dashboard/PendingSubmitButton";
import { deleteInventoryItemAction, deleteLabCaseAction } from "@/app/dashboard/delete-actions";
import { addInventoryItemAction, addLabCaseAction, adjustInventoryAction, createPurchaseOrderAction, recordInventoryUsageAction, updateLabCaseAction } from "./actions";

const statuses = ["SENT_TO_LAB", "IN_PROGRESS", "READY", "DELIVERED", "CANCELLED"];
const statusStyles: Record<string, string> = {
  SENT_TO_LAB: "bg-sky-100 text-sky-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  READY: "bg-emerald-100 text-emerald-800",
  DELIVERED: "bg-violet-100 text-violet-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

export default async function OperationsPage() {
  const user = await requireUser();
  const [items, labCases, patients, treatmentPlans, movements, purchaseOrders] = await Promise.all([
    prisma.inventoryItem.findMany({ where: { clinicId: user.clinicId, active: true }, orderBy: [{ quantity: "asc" }, { name: "asc" }] }),
    prisma.labCase.findMany({ where: { clinicId: user.clinicId }, include: { patient: true }, orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }], take: 40 }),
    prisma.patient.findMany({ where: { clinicId: user.clinicId }, select: { id: true, fullName: true, phone: true }, orderBy: { fullName: "asc" }, take: 75 }),
    prisma.treatmentPlan.findMany({ where: { patient: { clinicId: user.clinicId } }, select: { id: true, patientId: true, title: true }, orderBy: { updatedAt: "desc" }, take: 75 }),
    prisma.inventoryMovement.findMany({ where: { clinicId: user.clinicId }, include: { inventoryItem: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.purchaseOrder.findMany({ where: { clinicId: user.clinicId }, include: { items: { include: { inventoryItem: { select: { name: true } } } } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const lowStock = items.filter((item) => item.quantity <= item.reorderLevel);
  const openLab = labCases.filter((item) => !["DELIVERED", "CANCELLED"].includes(item.status));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueLab = openLab.filter((item) => item.dueDate && item.dueDate < today);
  const expiringSoon = items.filter((item) => item.expiryDate && item.expiryDate >= today && item.expiryDate <= new Date(today.getTime() + 90 * 86400000));
  const cards = [
    { label: "Inventory items", value: items.length, icon: PackageCheck, tone: "bg-cyan-50 text-cyan-700" },
    { label: "Low stock", value: lowStock.length, icon: AlertTriangle, tone: "bg-amber-50 text-amber-800" },
    { label: "Open lab cases", value: openLab.length, icon: FlaskConical, tone: "bg-violet-50 text-violet-700" },
    { label: "Lab cases overdue", value: overdueLab.length, icon: Truck, tone: "bg-rose-50 text-rose-700" },
    { label: "Expiring in 90 days", value: expiringSoon.length, icon: CalendarClock, tone: "bg-orange-50 text-orange-700" },
  ];

  return (
    <div className="dashboard-list-page mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Clinic operations</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Inventory & lab workflow</h1>
        <p className="mt-2 text-muted-foreground">
          Track essential clinical supplies and every outside-lab case from dispatch to delivery.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
              </div>
              <div className={`grid size-10 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-5" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Add or update inventory</h2>
          </div>
          <form action={addInventoryItemAction} className="mt-5 grid gap-3 sm:grid-cols-2">
            <input name="name" required placeholder="Item name" className="h-11 rounded-xl border px-3" />
            <input name="category" placeholder="Category" className="h-11 rounded-xl border px-3" />
            <input name="quantity" type="number" min="0" defaultValue="0" placeholder="Current quantity" className="h-11 rounded-xl border px-3" />
            <input name="reorderLevel" type="number" min="0" defaultValue="0" placeholder="Reorder level" className="h-11 rounded-xl border px-3" />
            <input name="unit" defaultValue="units" placeholder="Unit" className="h-11 rounded-xl border px-3" />
            <input name="costPerUnit" type="number" min="0" placeholder="Cost per unit (Rs.)" className="h-11 rounded-xl border px-3" />
            <input name="supplier" placeholder="Supplier (optional)" className="h-11 rounded-xl border px-3" />
            <input name="batchNumber" placeholder="Batch number (optional)" className="h-11 rounded-xl border px-3" />
            <input name="expiryDate" type="date" className="h-11 rounded-xl border px-3" />
            <PendingSubmitButton label="Save inventory item" pendingLabel="Saving inventory..." className="h-11 rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-70 sm:col-span-2" />
          </form>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <FlaskConical className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Create lab case</h2>
          </div>
          <form action={addLabCaseAction} className="mt-5 grid gap-3 sm:grid-cols-2">
            <select required name="patientId" className="h-11 rounded-xl border bg-card px-3">
              <option value="">Select patient</option>
              {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName} — {patient.phone}</option>)}
            </select>
            <select name="treatmentPlanId" className="h-11 rounded-xl border bg-card px-3">
              <option value="">Treatment plan (optional)</option>
              {treatmentPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.title}</option>)}
            </select>
            <input required name="labName" placeholder="Lab name" className="h-11 rounded-xl border px-3" />
            <input required name="caseType" placeholder="Case type (crown, aligner...)" className="h-11 rounded-xl border px-3" />
            <input name="dueDate" type="date" className="h-11 rounded-xl border px-3" />
            <input name="notes" placeholder="Instructions / shade / notes" className="h-11 rounded-xl border px-3" />
            <PendingSubmitButton label="Create lab case" pendingLabel="Creating lab case..." className="h-11 rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-70 sm:col-span-2" />
          </form>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold">Stock levels</h2>
          <p className="mt-1 text-sm text-muted-foreground">Items at or below their reorder level are highlighted.</p>
        </div>
        {items.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">No inventory items added yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <article key={item.id} className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{item.name}</p>
                    {item.quantity <= item.reorderLevel && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">Reorder</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.category} · {item.quantity} {item.unit} available · reorder at {item.reorderLevel}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.supplier ? `Supplier: ${item.supplier}` : "Supplier not recorded"}
                    {item.batchNumber ? ` · Batch: ${item.batchNumber}` : ""}
                    {item.expiryDate ? ` · Expires ${item.expiryDate.toLocaleDateString("en-IN")}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={adjustInventoryAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <input name="adjustment" type="number" required placeholder="+ / - quantity" className="h-10 w-36 rounded-xl border px-3 text-sm" />
                    <PendingSubmitButton label="Adjust" pendingLabel="Saving..." className="h-10 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted disabled:opacity-70" />
                  </form>
                  <form action={deleteInventoryItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <DeleteSubmitButton confirmMessage={`Delete inventory item ${item.name}?`} />
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold">Record treatment usage</h2>
          <p className="mt-1 text-sm text-muted-foreground">Deduct consumables with an auditable patient or treatment reference.</p>
          <form action={recordInventoryUsageAction} className="mt-5 grid gap-3 sm:grid-cols-2">
            <select name="id" required className="h-11 rounded-xl border bg-card px-3"><option value="">Select item</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit})</option>)}</select>
            <input name="quantity" type="number" min="1" required placeholder="Quantity used" className="h-11 rounded-xl border px-3" />
            <select name="patientId" className="h-11 rounded-xl border bg-card px-3"><option value="">Patient (optional)</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}</select>
            <select name="treatmentPlanId" className="h-11 rounded-xl border bg-card px-3"><option value="">Treatment plan (optional)</option>{treatmentPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.title}</option>)}</select>
            <input name="notes" placeholder="Usage note (optional)" className="h-11 rounded-xl border px-3 sm:col-span-2" />
            <PendingSubmitButton label="Record usage" pendingLabel="Recording usage..." className="h-11 rounded-xl bg-slate-900 px-4 font-semibold text-white disabled:opacity-70 sm:col-span-2" />
          </form>
        </article>
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold">Create purchase order</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create a supplier order from a low-stock item; receiving stock remains an explicit adjustment.</p>
          <form action={createPurchaseOrderAction} className="mt-5 grid gap-3 sm:grid-cols-2">
            <select name="inventoryItemId" required className="h-11 rounded-xl border bg-card px-3"><option value="">Select item</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <input name="quantity" type="number" min="1" required placeholder="Order quantity" className="h-11 rounded-xl border px-3" />
            <input name="supplier" required placeholder="Supplier name" className="h-11 rounded-xl border px-3" />
            <input name="notes" placeholder="Reference / note" className="h-11 rounded-xl border px-3" />
            <PendingSubmitButton label="Create purchase order" pendingLabel="Creating order..." className="h-11 rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-70 sm:col-span-2" />
          </form>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="border-b px-6 py-5"><h2 className="text-lg font-bold">Recent stock movement</h2></div><div className="divide-y">{movements.length ? movements.map((movement) => <div key={movement.id} className="flex items-center justify-between px-6 py-3 text-sm"><div><p className="font-semibold">{movement.inventoryItem.name}</p><p className="text-muted-foreground">{movement.type.replaceAll("_", " ")} · {movement.recordedBy || "Staff"}</p></div><p className={movement.quantityChange < 0 ? "font-bold text-rose-700" : "font-bold text-emerald-700"}>{movement.quantityChange > 0 ? "+" : ""}{movement.quantityChange}</p></div>) : <p className="px-6 py-10 text-sm text-muted-foreground">Movements will appear here after stock is used or adjusted.</p>}</div></article>
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="border-b px-6 py-5"><h2 className="text-lg font-bold">Recent purchase orders</h2></div><div className="divide-y">{purchaseOrders.length ? purchaseOrders.map((order) => <div key={order.id} className="flex items-center justify-between px-6 py-3 text-sm"><div><p className="font-semibold">{order.supplier}</p><p className="text-muted-foreground">{order.items.map((item) => `${item.inventoryItem.name} × ${item.quantity}`).join(", ")}</p></div><span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-bold text-sky-800">{order.status}</span></div>) : <p className="px-6 py-10 text-sm text-muted-foreground">Purchase orders will appear here.</p>}</div></article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold">Lab cases</h2>
          <p className="mt-1 text-sm text-muted-foreground">Update status as the lab receives, completes, and returns each case.</p>
        </div>
        {labCases.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">No lab cases created yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {labCases.map((labCase) => (
              <article key={labCase.id} className="flex flex-col gap-4 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{labCase.caseType}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[labCase.status]}`}>
                      {labCase.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {labCase.patient.fullName} · {labCase.labName}
                    {labCase.dueDate ? ` · Due ${labCase.dueDate.toLocaleDateString("en-IN")}` : ""}
                  </p>
                  {labCase.notes && <p className="mt-2 text-sm">{labCase.notes}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={updateLabCaseAction} className="flex gap-2">
                    <input type="hidden" name="id" value={labCase.id} />
                    <select name="status" defaultValue={labCase.status} className="h-10 rounded-xl border bg-card px-3 text-sm">
                      {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                    </select>
                    <button className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700">
                      Update
                    </button>
                  </form>
                  <form action={deleteLabCaseAction}>
                    <input type="hidden" name="id" value={labCase.id} />
                    <DeleteSubmitButton confirmMessage={`Delete lab case ${labCase.caseType}?`} />
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
