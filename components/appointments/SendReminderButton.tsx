"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, MessageCircleMore } from "lucide-react";

export default function SendReminderButton({ appointmentId, sentAt }: { appointmentId: number; sentAt: string | null }) {
  const [sending, setSending] = useState(false); const router = useRouter();
  async function sendReminder() { setSending(true); try { const response = await fetch(`/api/appointments/${appointmentId}/reminder`, { method: "POST" }); const body = await response.json(); if (!response.ok) throw new Error(body.error); toast.success("WhatsApp reminder sent."); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not send reminder."); } finally { setSending(false); } }
  return <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700 disabled:pointer-events-none disabled:opacity-70" type="button" disabled={sending} onClick={sendReminder}>{sending ? <><LoaderCircle className="size-4 animate-spin" /> Sending...</> : <><MessageCircleMore className="size-4" /> {sentAt ? "Send reminder again" : "Send WhatsApp reminder"}</>}</button>;
}
