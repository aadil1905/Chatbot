"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Loader2, Save, Stethoscope } from "lucide-react";
import { toast } from "sonner";

type RecordValue = {
  id: number;
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

const conditions = [
  "AIDS", "Drug allergies", "Heart conditions", "Rheumatic fever", "Hypertension",
  "Diabetes", "Asthma", "Hepatitis", "Abnormal bleeding/bruising", "Kidney disease",
  "Anemia", "Fits/faints", "Infectious diseases", "Pregnancy", "Medications",
];

function selectedHistory(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default function PatientMedicalEditForm({ record }: { patientId: number; record: RecordValue | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const selected = selectedHistory(record?.medicalHistory ?? null).map((item) => item.toLowerCase());
  const inputClass = "mt-2 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/10";
  const textareaClass = "mt-2 min-h-28 w-full rounded-xl border border-input bg-white p-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/10";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!record) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch(`/api/clinical-records/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chiefComplaint: String(form.get("chiefComplaint") || ""),
          diagnosis: String(form.get("diagnosis") || ""),
          clinicalNotes: String(form.get("clinicalNotes") || ""),
          medicalHistory: form.getAll("medicalHistory").map(String),
          drugAllergies: String(form.get("drugAllergies") || ""),
          medications: String(form.get("medications") || ""),
          otherHistory: String(form.get("otherHistory") || ""),
          bloodPressure: String(form.get("bloodPressure") || ""),
          weightKg: String(form.get("weightKg") || ""),
          dentalHistory: String(form.get("dentalHistory") || ""),
          treatmentDone: String(form.get("treatmentDone") || ""),
          estimateAmount: String(form.get("estimateAmount") || ""),
          consentGiven: form.get("consentGiven") === "on",
          consentNotes: String(form.get("consentNotes") || ""),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Medical details could not be saved.");
      toast.success("Medical and dental details updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Medical details could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (!record) {
    return (
      <section className="rounded-3xl border border-dashed bg-white p-8 text-center shadow-sm">
        <Stethoscope className="mx-auto size-10 text-sky-600" />
        <h2 className="mt-3 text-xl font-bold">No medical intake record yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Send the patient a form from Patient Intake. Their medical history and consent will become editable here after clinic review.
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b bg-gradient-to-r from-violet-50 to-white px-6 py-5">
        <div className="grid size-11 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Activity className="size-5" /></div>
        <div><h2 className="text-lg font-bold">Medical, dental and consent details</h2><p className="mt-1 text-sm text-muted-foreground">Editing the latest clinical/intake record.</p></div>
      </div>
      <div className="space-y-7 p-6">
        <section>
          <h3 className="font-bold">Clinical summary</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold">Chief complaint<input required name="chiefComplaint" defaultValue={record.chiefComplaint} className={inputClass} /></label>
            <label className="text-sm font-semibold">Diagnosis<input name="diagnosis" defaultValue={record.diagnosis ?? ""} className={inputClass} /></label>
            <label className="text-sm font-semibold md:col-span-2">Clinical notes<textarea name="clinicalNotes" defaultValue={record.clinicalNotes ?? ""} className={textareaClass} /></label>
          </div>
        </section>

        <section>
          <h3 className="font-bold">Medical conditions</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {conditions.map((condition) => (
              <label key={condition} className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 text-sm font-medium">
                <input type="checkbox" name="medicalHistory" value={condition} defaultChecked={selected.includes(condition.toLowerCase())} className="size-4 accent-primary" />
                {condition}
              </label>
            ))}
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold">Drug allergies<textarea name="drugAllergies" defaultValue={record.drugAllergies ?? ""} className={textareaClass} /></label>
            <label className="text-sm font-semibold">Current medications<textarea name="medications" defaultValue={record.medications ?? ""} className={textareaClass} /></label>
            <label className="text-sm font-semibold">Other medical history<textarea name="otherHistory" defaultValue={record.otherHistory ?? ""} className={textareaClass} /></label>
            <div className="grid content-start grid-cols-2 gap-4">
              <label className="text-sm font-semibold">Blood pressure<input name="bloodPressure" defaultValue={record.bloodPressure ?? ""} className={inputClass} /></label>
              <label className="text-sm font-semibold">Weight<input name="weightKg" defaultValue={record.weightKg ?? ""} className={inputClass} /></label>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold">Dental history<textarea name="dentalHistory" defaultValue={record.dentalHistory ?? ""} className={textareaClass} /></label>
          <label className="text-sm font-semibold">Treatment done or proposed<textarea name="treatmentDone" defaultValue={record.treatmentDone ?? ""} className={textareaClass} /></label>
          <label className="text-sm font-semibold">Estimate amount (₹)<input name="estimateAmount" type="number" min="0" defaultValue={record.estimateAmount ?? ""} className={inputClass} /></label>
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <label className="flex items-start gap-3 text-sm font-semibold text-emerald-950">
            <input name="consentGiven" type="checkbox" defaultChecked={record.consentGiven} className="mt-0.5 size-4 accent-emerald-600" />
            Patient consent confirmed
          </label>
          <label className="mt-4 block text-sm font-semibold text-emerald-950">Consent notes<textarea name="consentNotes" defaultValue={record.consentNotes ?? ""} className={textareaClass} /></label>
        </section>
      </div>
      <div className="flex justify-end border-t bg-slate-50 px-6 py-4">
        <button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving..." : "Save medical details"}
        </button>
      </div>
    </form>
  );
}
