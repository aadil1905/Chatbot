"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SendInvoiceWhatsAppButton({ invoiceId }: { invoiceId: number }) {
  const [sending, setSending] = useState(false);

  async function sendInvoice() {
    setSending(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send-whatsapp`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not send invoice.");
      toast.success("Invoice sent on WhatsApp.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send invoice on WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Button type="button" onClick={sendInvoice} disabled={sending} className="gap-2">
      <Send className="size-4" />
      {sending ? "Sending..." : "Send WhatsApp"}
    </Button>
  );
}
