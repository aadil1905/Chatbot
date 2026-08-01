"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AppointmentVisit = {
  id: number;
  appointmentDate: string | Date;
  appointmentTime: string;
  treatment: string;
  status: string;
};

type Patient = {
  id: number;
  fullName: string;
  phone: string;
  appointments?: AppointmentVisit[];
};

type ClinicalRecordFormProps = {
  patients: Patient[];
  selectedPatientId?: number;
  editingRecord?: {
    id: number;
    patientId: number;
    visitDate: string | Date;
    chiefComplaint: string;
    diagnosis: string | null;
    clinicalNotes: string | null;
    medicalHistory: string | null;
    drugAllergies: string | null;
    medications: string | null;
    otherHistory: string | null;
    bloodPressure: string | null;
    weightKg: string | null;
    dentalHistory: string | null;
    treatmentDone: string | null;
    estimateAmount: number | null;
    consentGiven: boolean;
    consentNotes: string | null;
  };
};

const medicalHistoryOptions = [
  "AIDS",
  "Drug Allergies",
  "Heart Condition",
  "Rheumatic Fever",
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Hepatitis",
  "Abnormal Bleeding/Bruising",
  "Kidney Disease",
  "Anemia",
  "Fits/Faints",
  "Infectious Disease",
  "Pregnancy",
  "Medications",
  "Other",
];

function dateKey(date: string | Date) {
  const value = new Date(date);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`;
}

function formatVisit(appointment: AppointmentVisit) {
  const date = new Date(appointment.appointmentDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${date} · ${appointment.appointmentTime} · ${appointment.treatment}`;
}

export default function ClinicalRecordForm({ patients, selectedPatientId, editingRecord }: ClinicalRecordFormProps) {
  const router = useRouter();
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const lockedPatientId = selectedPatient?.id;
  const [patientId, setPatientId] = useState(lockedPatientId ? String(lockedPatientId) : "");
  const [saving, setSaving] = useState(false);

  const patient = useMemo(() => patients.find((item) => item.id === Number(patientId)), [patientId, patients]);
  const completedAppointments = (patient?.appointments || []).filter((appointment) => appointment.status === "Completed");
  const canSave = Boolean(patientId) && completedAppointments.length > 0 && !saving;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (completedAppointments.length === 0) {
      toast.error("Complete an appointment first, then save medical history for that visit.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData(event.currentTarget);
      const form = Object.fromEntries(formData.entries());
      const selectedVisitDate = String(form.visitDate || "");
      const response = await fetch(editingRecord ? `/api/clinical-records/${editingRecord.id}` : "/api/clinical-records", {
        method: editingRecord ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          medicalHistory: formData.getAll("medicalHistory").map(String),
          consentGiven: formData.get("consentGiven") === "on",
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      toast.success(editingRecord ? "Case paper updated." : "Medical history saved to the selected appointment date.");
      router.push(`/dashboard/patients/${body.patientId}?visit=${selectedVisitDate}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="clinic-workflow-form space-y-6 rounded-3xl border bg-white p-6 shadow-sm">
      {selectedPatient ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Continuing medical history for {selectedPatient.fullName}</p>
          <p className="mt-1">This record will attach to one completed appointment date. No new appointment is created.</p>
        </div>
      ) : null}

      {lockedPatientId ? <input type="hidden" name="patientId" value={lockedPatientId} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Patient
          <select
            required
            name={lockedPatientId ? undefined : "patientId"}
            value={patientId}
            onChange={(event) => setPatientId(event.target.value)}
            disabled={Boolean(lockedPatientId)}
            className="h-11 w-full rounded-xl border bg-background px-3 disabled:cursor-not-allowed disabled:bg-muted"
          >
            <option value="">Select patient</option>
            {patients.map((item) => (
              <option key={item.id} value={item.id}>{item.fullName} - {item.phone}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          Completed appointment date
            <select required name="visitDate" defaultValue={editingRecord ? dateKey(editingRecord.visitDate) : undefined} disabled={completedAppointments.length === 0} className="h-11 w-full rounded-xl border bg-background px-3 disabled:bg-muted">
            {completedAppointments.length === 0 ? (
              <option value="">No completed appointments</option>
            ) : (
              completedAppointments.map((appointment) => (
                <option key={appointment.id} value={dateKey(appointment.appointmentDate)}>{formatVisit(appointment)}</option>
              ))
            )}
          </select>
        </label>
      </div>

      {patientId && completedAppointments.length === 0 ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          This patient has no completed appointment yet. Mark the appointment as Completed first, then add clinical records.
        </p>
      ) : null}

      <section className="rounded-3xl border bg-slate-50/80 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Visit notes</h2>
          <p className="text-sm text-muted-foreground">Main complaint and diagnosis for this appointment date.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium">
            Chief complaint
            <Textarea required name="chiefComplaint" defaultValue={editingRecord?.chiefComplaint ?? ""} rows={3} placeholder="Reason for visit" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Diagnosis
            <Textarea name="diagnosis" defaultValue={editingRecord?.diagnosis ?? ""} rows={3} placeholder="Clinical diagnosis" />
          </label>
          <label className="block space-y-2 text-sm font-medium md:col-span-2">
            Clinical notes
            <Textarea name="clinicalNotes" defaultValue={editingRecord?.clinicalNotes ?? ""} rows={5} placeholder="Examination findings, treatment advice, follow-up" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Medical history</h2>
          <p className="text-sm text-muted-foreground">Matches the clinic case paper and makes risk factors visible in patient summary.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {medicalHistoryOptions.map((option) => (
            <label key={option} className="flex items-center gap-3 rounded-2xl border bg-slate-50 px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/5">
              <input name="medicalHistory" type="checkbox" value={option} defaultChecked={editingRecord ? (editingRecord.medicalHistory ?? "").includes(option) : false} className="size-4 rounded border-slate-300 accent-primary" />
              {option}
            </label>
          ))}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium">
            Blood pressure
            <input name="bloodPressure" defaultValue={editingRecord?.bloodPressure ?? ""} placeholder="Example: 120/80" className="h-11 w-full rounded-xl border bg-background px-3" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Weight
            <input name="weightKg" defaultValue={editingRecord?.weightKg ?? ""} placeholder="Example: 65 kg" className="h-11 w-full rounded-xl border bg-background px-3" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Drug allergies
            <Textarea name="drugAllergies" defaultValue={editingRecord?.drugAllergies ?? ""} rows={3} placeholder="Medicine/food allergy details" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Current medications
            <Textarea name="medications" defaultValue={editingRecord?.medications ?? ""} rows={3} placeholder="Current medicines or supplements" />
          </label>
          <label className="block space-y-2 text-sm font-medium md:col-span-2">
            Other medical history
            <Textarea name="otherHistory" defaultValue={editingRecord?.otherHistory ?? ""} rows={3} placeholder="Any other condition, pregnancy notes, surgery history, etc." />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border bg-slate-50/80 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Dental treatment and estimate</h2>
          <p className="text-sm text-muted-foreground">Saved under the selected appointment date and shown in patient summary.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium">
            Dental history
            <Textarea name="dentalHistory" defaultValue={editingRecord?.dentalHistory ?? ""} rows={4} placeholder="Past dental pain, previous treatment, habits, sensitivity, etc." />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Dental treatment done/advised
            <Textarea name="treatmentDone" defaultValue={editingRecord?.treatmentDone ?? ""} rows={4} placeholder="Example: RCT started on 26, cap advised, follow-up after 7 days" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Estimate amount
            <input name="estimateAmount" defaultValue={editingRecord?.estimateAmount ?? ""} type="number" min="0" placeholder="Example: 8000" className="h-11 w-full rounded-xl border bg-background px-3" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5">
        <label className="flex items-start gap-3 rounded-2xl border bg-emerald-50 p-4 text-sm font-medium text-emerald-950">
          <input name="consentGiven" type="checkbox" defaultChecked={editingRecord?.consentGiven ?? false} className="mt-1 size-4 rounded border-emerald-300 accent-emerald-600" />
          <span>
            Patient consent taken
            <span className="mt-1 block font-normal text-emerald-800">Use this when the patient/guardian has agreed to the procedure and clinic consent process.</span>
          </span>
        </label>
        <label className="mt-4 block space-y-2 text-sm font-medium">
          Consent notes
          <Textarea name="consentNotes" defaultValue={editingRecord?.consentNotes ?? ""} rows={3} placeholder="Consent person, guardian name, procedure explained, signature reference, etc." />
        </label>
      </section>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={!canSave}>{saving ? "Saving..." : "Save medical history"}</Button>
      </div>
    </form>
  );
}
