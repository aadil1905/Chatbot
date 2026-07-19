"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PaymentForm({ invoiceId, outstanding }: { invoiceId: number; outstanding: number }) {
  const router = useRouter(); const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); try { const response = await fetch(`/api/invoices/${invoiceId}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); toast.success("Payment recorded."); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not record payment."); } finally { setSaving(false); } }
  return <form onSubmit={submit} className="space-y-4"><p className="text-sm text-muted-foreground">Outstanding balance: <span className="font-semibold text-foreground">₹{outstanding.toLocaleString("en-IN")}</span></p><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">Amount<Input required name="amount" type="number" min="1" max={outstanding} placeholder="0" /></label><label className="space-y-2 text-sm font-medium">Method<select required name="method" className="h-9 w-full rounded-md border bg-background px-3"><option>Cash</option><option>UPI</option><option>Card</option><option>Bank transfer</option><option>Other</option></select></label><label className="space-y-2 text-sm font-medium">Payment date<Input required name="paidAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label></div><label className="block space-y-2 text-sm font-medium">Notes<Textarea name="notes" rows={3} placeholder="Optional payment reference" /></label><Button type="submit" disabled={saving || outstanding === 0}>{saving ? "Recording..." : "Record payment"}</Button></form>;
}
