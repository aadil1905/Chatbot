import { Download, FileSpreadsheet, ShieldCheck } from "lucide-react";

const exports = [
  { name: "Appointments", description: "Schedule, treatments, statuses, sources, and reminder history.", href: "/api/exports/appointments", tone: "bg-blue-50 text-blue-700" },
  { name: "Patients", description: "Patient contact details, demographics, addresses, and medical notes.", href: "/api/exports/patients", tone: "bg-cyan-50 text-cyan-700" },
  { name: "Billing", description: "Invoices, payment totals, outstanding balances, and invoice status.", href: "/api/exports/billing", tone: "bg-emerald-50 text-emerald-700" },
];

export default function ExportsPage() {
  return <div className="mx-auto max-w-5xl space-y-6"><header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Clinic data</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Exports</h1><p className="mt-2 max-w-2xl text-muted-foreground">Download current clinic data as CSV files. CSV opens directly in Excel, Google Sheets, and most accounting tools.</p></header><section className="grid gap-5 md:grid-cols-3">{exports.map((item) => <article key={item.name} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"><div className={`grid size-11 place-items-center rounded-xl ${item.tone}`}><FileSpreadsheet className="size-5" /></div><h2 className="mt-5 text-lg font-bold">{item.name}</h2><p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.description}</p><a href={item.href} className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"><Download className="size-4" />Download CSV</a></article>)}</section><section className="flex gap-4 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5 text-sm text-cyan-950"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-cyan-700" /><div><p className="font-semibold">Your downloads are generated on demand</p><p className="mt-1 text-cyan-900/80">No new database tables are added. Exports include only the data already stored in your clinic system.</p></div></section></div>;
}
