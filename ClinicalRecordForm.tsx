"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Patient = { id: number; fullName: string; phone: string };

export default function ClinicalRecordForm({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch("/api/clinical-records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      toast.success("Clinical record saved."); router.push(`/dashboard/patients/${body.patientId}`); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save record."); }
    finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="space-y-6"><div className="grid gap-5 md:grid-cols-2"><label className="space-y-2 text-sm font-medium">Patient<select required name="patientId" className="h-9 w-full rounded-md border bg-background px-3"><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName} - {patient.phone}</option>)}</select></label><label className="space-y-2 text-sm font-medium">Visit date<Input required name="visitDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label></div><label className="block space-y-2 text-sm font-medium">Chief complaint<Textarea required name="chiefComplaint" rows={3} placeholder="Reason for visit" /></label><label className="block space-y-2 text-sm font-medium">Diagnosis<Textarea name="diagnosis" rows={3} placeholder="Clinical diagnosis" /></label><label className="block space-y-2 text-sm font-medium">Clinical notes<Textarea name="clinicalNotes" rows={6} placeholder="Examination findings, treatment provided, follow-up" /></label><div className="flex justify-end gap-3 border-t pt-5"><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save clinical record"}</Button></div></form>;
}
