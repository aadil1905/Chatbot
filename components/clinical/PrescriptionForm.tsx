"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AppointmentVisit = { id: number; appointmentDate: string | Date; appointmentTime: string; treatment: string; status: string };
type Patient = { id: number; fullName: string; phone: string; appointments?: AppointmentVisit[] };

function dateKey(date: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(date));
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`;
}

function formatVisit(appointment: AppointmentVisit) {
  return `${new Date(appointment.appointmentDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" })} · ${appointment.appointmentTime} · ${appointment.treatment}`;
}

export default function PrescriptionForm({ patients, initialPatientId }: { patients: Patient[]; initialPatientId?: number }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [patientId, setPatientId] = useState(initialPatientId ? String(initialPatientId) : "");
  const patient = useMemo(() => patients.find((item) => item.id === Number(patientId)), [patientId, patients]);
  const completedAppointments = (patient?.appointments || []).filter((appointment) => appointment.status === "Completed");
  const canSave = Boolean(patientId) && completedAppointments.length > 0 && !saving;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (completedAppointments.length === 0) { toast.error("Complete an appointment first, then save prescription for that visit."); return; }
    setSaving(true);
    try {
      const form = Object.fromEntries(new FormData(event.currentTarget).entries());
      const selectedVisitDate = String(form.prescribedOn || "");
      const response = await fetch("/api/prescriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error);
      toast.success("Prescription saved to the selected appointment date.");
      router.push(`/dashboard/patients/${body.patientId}?visit=${selectedVisitDate}`); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save prescription."); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="clinic-workflow-form space-y-6 rounded-3xl border bg-white p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">Patient<select required name="patientId" value={patientId} onChange={(event) => setPatientId(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3"><option value="">Select patient</option>{patients.map((item) => <option key={item.id} value={item.id}>{item.fullName} - {item.phone}</option>)}</select></label>
        <label className="space-y-2 text-sm font-medium">Completed appointment date<select required name="prescribedOn" disabled={completedAppointments.length === 0} className="h-11 w-full rounded-xl border bg-background px-3 disabled:bg-muted">{completedAppointments.length === 0 ? <option value="">No completed appointments</option> : completedAppointments.map((appointment) => <option key={appointment.id} value={dateKey(appointment.appointmentDate)}>{formatVisit(appointment)}</option>)}</select></label>
      </div>
      {patientId && completedAppointments.length === 0 ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">This patient has no completed appointment yet. Mark the appointment as Completed first, then save a prescription.</p> : null}
      <label className="block space-y-2 text-sm font-medium">Diagnosis (optional)<Input name="diagnosis" placeholder="Clinical diagnosis or treatment indication" /></label>
      <label className="block space-y-2 text-sm font-medium">Medicines<span className="block text-xs font-normal text-muted-foreground">One medicine per line: name - dose - frequency - duration</span><Textarea required name="medicines" rows={7} placeholder={"Amoxicillin 500 mg - 1 tablet - twice daily - 5 days\nParacetamol 650 mg - 1 tablet - as needed - 3 days"} /></label>
      <label className="block space-y-2 text-sm font-medium">Patient instructions (optional)<Textarea name="instructions" rows={4} placeholder="After-care, food advice, or when to contact the clinic" /></label>
      <div className="flex justify-end gap-3 border-t pt-5"><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button><Button type="submit" disabled={!canSave}>{saving ? "Saving..." : "Save prescription"}</Button></div>
    </form>
  );
}
