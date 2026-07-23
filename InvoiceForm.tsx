"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Patient = { id: number; fullName: string; phone: string };
type Plan = { id: number; title: string; patientId: number };

export default function InvoiceForm({ patients, plans }: { patients: Patient[]; plans: Plan[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [patientId, setPatientId] = useState("");
  const availablePlans = plans.filter((plan) => !patientId || plan.patientId === Number(patientId));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      toast.success("Invoice created.");
      router.push(`/dashboard/billing/${body.id}`);
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create invoice."); }
    finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="space-y-6"><div className="grid gap-5 md:grid-cols-2"><label className="space-y-2 text-sm font-medium">Patient<select required name="patientId" value={patientId} onChange={(event) => setPatientId(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3"><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName} - {patient.phone}</option>)}</select></label><label className="space-y-2 text-sm font-medium">Treatment plan (optional)<select name="treatmentPlanId" className="h-9 w-full rounded-md border bg-background px-3"><option value="">No treatment plan</option>{availablePlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.title}</option>)}</select></label><label className="space-y-2 text-sm font-medium">Invoice date<Input required name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label><label className="space-y-2 text-sm font-medium">Due date (optional)<Input name="dueDate" type="date" /></label><label className="space-y-2 text-sm font-medium md:col-span-2">Total amount (INR)<Input required name="totalAmount" type="number" min="1" placeholder="0" /></label></div><label className="block space-y-2 text-sm font-medium">Notes<Textarea name="notes" rows={5} placeholder="Procedures, discounts, or payment instructions" /></label><div className="flex justify-end gap-3 border-t pt-5"><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create invoice"}</Button></div></form>;
}
