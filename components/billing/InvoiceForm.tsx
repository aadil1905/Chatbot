"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AppointmentVisit = { id: number; appointmentDate: string | Date; appointmentTime: string; treatment: string; status: string };
type Patient = { id: number; fullName: string; phone: string; appointments?: AppointmentVisit[] };
type Plan = { id: number; title: string; patientId: number; visitDate?: string | Date | null };

function dateKey(date: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(date));
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`;
}

function formatVisit(appointment: AppointmentVisit) {
  return `${new Date(appointment.appointmentDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" })} · ${appointment.appointmentTime} · ${appointment.treatment}`;
}

export default function InvoiceForm({ patients, plans }: { patients: Patient[]; plans: Plan[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [patientId, setPatientId] = useState("");
  const patient = useMemo(() => patients.find((item) => item.id === Number(patientId)), [patientId, patients]);
  const completedAppointments = (patient?.appointments || []).filter((appointment) => appointment.status === "Completed");
  const availablePlans = plans.filter((plan) => !patientId || plan.patientId === Number(patientId));
  const canSave = Boolean(patientId) && completedAppointments.length > 0 && !saving;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (completedAppointments.length === 0) { toast.error("Complete an appointment first, then create an invoice for that visit."); return; }
    setSaving(true);
    try {
      const form = Object.fromEntries(new FormData(event.currentTarget).entries());
      const selectedVisitDate = String(form.issueDate || "");
      const response = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      toast.success("Invoice created for the selected appointment date.");
      router.push(`/dashboard/patients/${body.patientId}?visit=${selectedVisitDate}`);
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create invoice."); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="clinic-workflow-form space-y-6 rounded-3xl border bg-white p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">Patient<select required name="patientId" value={patientId} onChange={(event) => setPatientId(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3"><option value="">Select patient</option>{patients.map((item) => <option key={item.id} value={item.id}>{item.fullName} - {item.phone}</option>)}</select></label>
        <label className="space-y-2 text-sm font-medium">Completed appointment date<select required name="issueDate" disabled={completedAppointments.length === 0} className="h-11 w-full rounded-xl border bg-background px-3 disabled:bg-muted">{completedAppointments.length === 0 ? <option value="">No completed appointments</option> : completedAppointments.map((appointment) => <option key={appointment.id} value={dateKey(appointment.appointmentDate)}>{formatVisit(appointment)}</option>)}</select></label>
        <label className="space-y-2 text-sm font-medium">Treatment plan (optional)<select name="treatmentPlanId" className="h-11 w-full rounded-xl border bg-background px-3"><option value="">No treatment plan</option>{availablePlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.title}{plan.visitDate ? ` · ${dateKey(plan.visitDate)}` : ""}</option>)}</select></label>
        <label className="space-y-2 text-sm font-medium">Due date (optional)<Input name="dueDate" type="date" /></label>
        <label className="space-y-2 text-sm font-medium md:col-span-2">Total amount (INR)<Input required name="totalAmount" type="number" min="1" placeholder="0" /></label>
      </div>
      {patientId && completedAppointments.length === 0 ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">This patient has no completed appointment yet. Mark the appointment as Completed first, then create an invoice.</p> : null}
      <label className="block space-y-2 text-sm font-medium">Notes<Textarea name="notes" rows={5} placeholder="Procedures, discounts, or payment instructions" /></label>
      <div className="flex justify-end gap-3 border-t pt-5"><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button><Button type="submit" disabled={!canSave}>{saving ? "Creating..." : "Create invoice"}</Button></div>
    </form>
  );
}
