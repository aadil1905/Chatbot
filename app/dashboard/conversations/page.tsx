import { MessagesSquare, Phone, Sparkles } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DeleteSubmitButton from "@/components/dashboard/DeleteSubmitButton";
import { deleteConversationAction } from "@/app/dashboard/delete-actions";
import { updateConversationAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const user = await requireUser();
  const [conversations, staff] = await Promise.all([prisma.whatsAppConversation.findMany({
    where: { clinicId: user.clinicId },
    include: {
      booking: true, assignedUser: { select: { id: true, fullName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 30,
  }), prisma.user.findMany({ where: { clinicId: user.clinicId, active: true }, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } })]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Inbox</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Patient conversations</h1>
          <p className="mt-2 text-muted-foreground">
            WhatsApp enquiries and unfinished bookings. Use the work queue for callbacks, no-shows, and overdue patient outreach.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/follow-ups" className="inline-flex items-center rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">Open work queue</Link>
          <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{conversations.length}</span> saved conversations
          </div>
        </div>
      </header>

      {conversations.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
          <MessagesSquare className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 text-lg font-bold">No WhatsApp conversations yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            When a patient messages your connected WhatsApp number, the enquiry and its booking progress will appear here.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="divide-y divide-border">
            {conversations.map((conversation) => {
              const latest = conversation.messages[0];
              return (
                <article key={conversation.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                          <Phone className="size-5" />
                        </div>
                        <p className="font-bold">{conversation.phone}</p>
                        {conversation.language && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{conversation.language}</span>}
                        {conversation.booking && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Booking: {conversation.booking.step}</span>}
                      </div>
                      <p className="mt-3 truncate text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{latest?.direction === "OUTBOUND" ? "Clinic:" : "Patient:"}</span> {latest?.content || "No saved message"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        Last activity {conversation.lastMessageAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <Link href={`/dashboard/patient-intake?name=${encodeURIComponent(conversation.booking?.patientName || "")}&phone=${encodeURIComponent(conversation.phone)}`} className="rounded-lg border bg-white px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/5">Start intake</Link>
                      <Link href="/dashboard/appointments/new" className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90">Book appointment</Link>
                      <Link href="/dashboard/follow-ups" className="rounded-lg border bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50">Add follow-up</Link>
                      <form action={updateConversationAction} className="flex gap-1"><input type="hidden" name="id" value={conversation.id} /><select name="assignedUserId" defaultValue={conversation.assignedUserId ?? ""} className="rounded-lg border bg-white px-2 py-1 text-xs"><option value="">Unassigned</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select><input name="label" defaultValue={conversation.label ?? ""} placeholder="Label" className="w-20 rounded-lg border px-2 text-xs"/><input type="hidden" name="status" value={conversation.status === "OPEN" ? "RESOLVED" : "OPEN"}/><button className="rounded-lg border px-2 text-xs font-bold">{conversation.status === "OPEN" ? "Resolve" : "Reopen"}</button></form>
                      <form action={deleteConversationAction}>
                        <input type="hidden" name="id" value={conversation.id} />
                        <DeleteSubmitButton confirmMessage={`Delete WhatsApp conversation ${conversation.phone}?`} />
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
