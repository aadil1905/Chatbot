import { Clock3, MessageCircle, PhoneMissed, Plus, Send, ShieldCheck, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addMissedCallAction, deleteMissedCallAction, markMissedCallContactedAction, sendAllPendingMissedCallsAction, sendMissedCallAction } from "./actions";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  SENT: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-rose-100 text-rose-800",
  COMPLETED: "bg-sky-100 text-sky-800",
};

function formatDateTime(date: Date) {
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function MissedCallsPage() {
  const user = await requireUser();
  const missedCalls = await prisma.followUpTask.findMany({
    where: { clinicId: user.clinicId, taskType: "MISSED_CALL" },
    orderBy: { scheduledFor: "desc" },
    take: 250,
  });

  const pendingCount = missedCalls.filter((call) => call.status === "PENDING" || call.status === "FAILED").length;
  const sentCount = missedCalls.filter((call) => call.status === "SENT").length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = missedCalls.filter((call) => call.scheduledFor >= today).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Patient communication</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Missed call logs</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Record clinic missed calls, then send a WhatsApp follow-up to one caller or all pending callers.
          </p>
        </div>
        <form action={sendAllPendingMissedCallsAction}>
          <button
            disabled={pendingCount === 0}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="size-4" />Send to all pending ({pendingCount})
          </button>
        </form>
      </header>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
        <strong>Important:</strong> automatic 24/7 call recording needs the clinic phone/call provider to send missed-call data to this app. Until that provider is connected, staff can add missed calls manually here.
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Missed today", value: todayCount, icon: PhoneMissed, tone: "bg-rose-50 text-rose-700" },
          { label: "Pending WhatsApp", value: pendingCount, icon: Clock3, tone: "bg-amber-50 text-amber-800" },
          { label: "Messages sent", value: sentCount, icon: MessageCircle, tone: "bg-emerald-50 text-emerald-700" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
              </div>
              <div className={`grid size-10 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-5" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Plus className="size-5 text-primary" />
          <h2 className="text-lg font-bold">Add missed call</h2>
        </div>
        <form action={addMissedCallAction} className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <label className="text-sm font-semibold text-slate-800">
            Caller name
            <input name="callerName" placeholder="Optional" className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 font-normal outline-none transition focus:border-primary" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Phone number
            <input name="phone" required placeholder="919876543210" className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 font-normal outline-none transition focus:border-primary" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Call time
            <input name="callReceivedAt" type="datetime-local" className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 font-normal outline-none transition focus:border-primary" />
          </label>
          <button className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700">
            Save call
          </button>
          <label className="text-sm font-semibold text-slate-800 lg:col-span-3">
            Notes
            <input name="notes" placeholder="Example: asked for appointment, line busy, repeat caller" className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 font-normal outline-none transition focus:border-primary" />
          </label>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-2">
            <PhoneMissed className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Call history</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Use approved WhatsApp templates for callers who have not messaged the clinic first.
          </p>
        </div>

        {missedCalls.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <PhoneMissed className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">No missed calls recorded yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Add one manually or connect a call provider webhook later.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {missedCalls.map((call) => (
              <article key={call.id} className="p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{call.patientName || "Unknown caller"}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[call.status] || "bg-muted text-muted-foreground"}`}>
                        {call.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{"Dashboard"}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{call.phone} · {formatDateTime(call.scheduledFor)}</p>
                    {call.message && <p className="mt-3 max-w-2xl text-sm">{call.message}</p>}
                    {call.errorMessage && <p className="mt-2 text-xs text-rose-700">Send error: {call.errorMessage}</p>}
                    {call.sentAt && <p className="mt-2 text-xs text-muted-foreground">WhatsApp sent: {formatDateTime(call.sentAt)}</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {call.status !== "SENT" && (
                      <form action={sendMissedCallAction}>
                        <input type="hidden" name="id" value={call.id} />
                        <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700">
                          <MessageCircle className="size-4" />Send WhatsApp
                        </button>
                      </form>
                    )}
                    {call.status !== "COMPLETED" && (
                      <form action={markMissedCallContactedAction}>
                        <input type="hidden" name="id" value={call.id} />
                        <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:bg-muted">
                          <ShieldCheck className="size-4" />Mark contacted
                        </button>
                      </form>
                    )}
                    <form action={deleteMissedCallAction}>
                      <input type="hidden" name="id" value={call.id} />
                      <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700">
                        <Trash2 className="size-4" />Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


