"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SendReminderButton({ appointmentId, sentAt }: { appointmentId: number; sentAt: string | null }) {
  const [sending, setSending] = useState(false); const router = useRouter();
  async function sendReminder() { setSending(true); try { const response = await fetch(`/api/appointments/${appointmentId}/reminder`, { method: "POST" }); const body = await response.json(); if (!response.ok) throw new Error(body.error); toast.success("WhatsApp reminder sent."); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not send reminder."); } finally { setSending(false); } }
  return <button className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold shadow-sm transition hover:brightness-95 disabled:pointer-events-none disabled:opacity-50" style={{ backgroundColor: "#0891b2", color: "#ffffff" }} type="button" disabled={sending} onClick={sendReminder}>{sending ? "Sending..." : sentAt ? "Send reminder again" : "Send WhatsApp reminder"}</button>;
}
