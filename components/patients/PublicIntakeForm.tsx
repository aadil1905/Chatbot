"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SignaturePad } from "@/components/patients/PatientIntakeWizard";

const conditions = [
  "AIDS", "Drug allergies", "Heart conditions", "Rheumatic fever", "Hypertension",
  "Diabetes", "Asthma", "Hepatitis", "Abnormal bleeding/bruising", "Kidney disease",
  "Anemia", "Fits/faints", "Infectious diseases", "Pregnancy", "Medications",
];

export default function PublicIntakeForm({ token, patientName }: { token: string; patientName: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [patientSignature, setPatientSignature] = useState("");
  const [guardianSignature, setGuardianSignature] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!patientSignature) return void toast.error("Please add the patient signature.");
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const response = await fetch(`/api/public-intake/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicalHistory: form.getAll("medicalHistory").map(String),
          drugAllergies: String(form.get("drugAllergies") || ""),
          medications: String(form.get("medications") || ""),
          otherHistory: String(form.get("otherHistory") || ""),
          bloodPressure: String(form.get("bloodPressure") || ""),
          weightKg: String(form.get("weightKg") || ""),
          dentalHistory: String(form.get("dentalHistory") || ""),
          consentGiven: form.get("consentGiven") === "on",
          consentNotes: String(form.get("consentNotes") || ""),
          patientSignature,
          guardianSignature,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "The form could not be submitted.");
      setCompleted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The form could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-600 focus:ring-3 focus:ring-sky-100";
  const textareaClass = "mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-sky-600 focus:ring-3 focus:ring-sky-100";

  if (completed) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">Form submitted successfully</h1>
        <p className="mt-2 text-slate-600">Thank you, {patientName}. The clinic has received your medical history and consent.</p>
        <p className="mt-5 text-sm text-slate-500">You can safely close this page.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-bold">Medical history</h2>
        <p className="mt-1 text-sm text-slate-600">Select every condition you currently have or previously had.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {conditions.map((condition) => (
            <label key={condition} className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 text-sm font-medium">
              <input type="checkbox" name="medicalHistory" value={condition} className="size-4 accent-sky-700" />
              {condition}
            </label>
          ))}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">Drug allergies<textarea name="drugAllergies" className={textareaClass} placeholder="List allergies and reactions, or write None" /></label>
          <label className="text-sm font-semibold">Current medications<textarea name="medications" className={textareaClass} placeholder="Medicine, dosage, and frequency" /></label>
          <label className="text-sm font-semibold">Other medical history<textarea name="otherHistory" className={textareaClass} placeholder="Other illness, surgery, pregnancy details, or notes" /></label>
          <div className="grid content-start gap-4 grid-cols-2">
            <label className="text-sm font-semibold">Blood pressure<input name="bloodPressure" className={inputClass} placeholder="120/80" /></label>
            <label className="text-sm font-semibold">Weight (kg)<input name="weightKg" className={inputClass} inputMode="decimal" placeholder="62" /></label>
          </div>
        </div>
        <label className="mt-5 block text-sm font-semibold">Dental history<textarea name="dentalHistory" className={textareaClass} placeholder="Previous dental treatments, concerns, or complications" /></label>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-emerald-700" /><h2 className="text-xl font-bold">Consent and signatures</h2></div>
        <ol className="mt-5 list-decimal space-y-2 rounded-2xl bg-slate-50 p-5 pl-10 text-sm leading-6 text-slate-700">
          <li>I authorize the doctor and designated assistants to examine me and perform the agreed dental procedure and anaesthesia where required.</li>
          <li>The procedure, alternatives, expected benefits, and material risks will be explained before treatment.</li>
          <li>I understand medicine and surgery are not exact sciences and no result can be guaranteed.</li>
          <li>I have disclosed relevant illnesses, allergies, medications, pregnancy, and previous treatment truthfully.</li>
          <li>I understand possible complications may include pain, swelling, bleeding, infection, altered sensation, or other procedure-specific risks.</li>
        </ol>
        <label className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-950">
          <input required name="consentGiven" type="checkbox" className="mt-0.5 size-4 accent-emerald-600" />
          I have read and understood this consent statement and agree to proceed.
        </label>
        <label className="mt-5 block text-sm font-semibold">Questions or consent notes<textarea name="consentNotes" className={textareaClass} /></label>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <SignaturePad label="Patient signature" required onChange={setPatientSignature} />
          <SignaturePad label="Guardian signature (if applicable)" onChange={setGuardianSignature} />
        </div>
      </section>

      <button disabled={submitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 font-bold text-white shadow-lg disabled:opacity-60">
        {submitting ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
        {submitting ? "Submitting securely..." : "Submit medical history and consent"}
      </button>
    </form>
  );
}
