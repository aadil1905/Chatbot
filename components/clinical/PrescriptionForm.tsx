"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Patient = { id: number; fullName: string; phone: string };

export default function PrescriptionForm({ patients, initialPatientId }: { patients: Patient[]; initialPatientId?: number }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch("/api/prescriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error);
      toast.success("Prescription saved in patient history.");
      router.push(`/dashboard/patients/${body.patientId}`); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save prescription."); }
    finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="space-y-6"><div className="grid gap-5 md:grid-cols-2"><label className="space-y-2 text-sm font-medium">Patient<select required name="patientId" defaultValue={initialPatientId ?? ""} className="h-9 w-full rounded-md border bg-background px-3"><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName} - {patient.phone}</option>)}</select></label><label className="space-y-2 text-sm font-medium">Prescription date<Input required name="prescribedOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label></div><label className="block space-y-2 text-sm font-medium">Diagnosis (optional)<Input name="diagnosis" placeholder="Clinical diagnosis or treatment indication" /></label><label className="block space-y-2 text-sm font-medium">Medicines<span className="block text-xs font-normal text-muted-foreground">One medicine per line: name — dose — frequency — duration</span><Textarea required name="medicines" rows={7} placeholder={"Amoxicillin 500 mg — 1 tablet — twice daily — 5 days\nParacetamol 650 mg — 1 tablet — as needed — 3 days"} /></label><label className="block space-y-2 text-sm font-medium">Patient instructions (optional)<Textarea name="instructions" rows={4} placeholder="After-care, food advice, or when to contact the clinic" /></label><div className="flex justify-end gap-3 border-t pt-5"><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save prescription"}</Button></div></form>;
}
