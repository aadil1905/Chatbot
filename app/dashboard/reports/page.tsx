export const dynamic = "force-dynamic";

import { BarChart3, CircleDollarSign, RefreshCcw, Target, TrendingUp, UserRoundCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const currency = (value: number) => `Rs. ${value.toLocaleString("en-IN")}`;
const percentage = (numerator: number, denominator: number) => denominator ? Math.round((numerator / denominator) * 100) : 0;

export default async function ReportsPage() {
  const user = await requireUser();
  const [leads, invoices, payments] = await Promise.all([
    prisma.lead.findMany({ where: { clinicId: user.clinicId }, select: { stage: true, source: true, lossReason: true, conversionValue: true, recoveredAt: true } }),
    prisma.invoice.findMany({ select: { totalAmount: true } }),
    prisma.payment.findMany({ select: { amount: true } }),
  ]);

  const total = leads.length;
  const booked = leads.filter((lead) => ["BOOKED", "VISITED", "CONVERTED"].includes(lead.stage)).length;
  const visited = leads.filter((lead) => ["VISITED", "CONVERTED"].includes(lead.stage)).length;
  const converted = leads.filter((lead) => lead.stage === "CONVERTED").length;
  const lost = leads.filter((lead) => lead.stage === "LOST").length;
  const recovered = leads.filter((lead) => lead.recoveredAt).length;
  const aiValue = leads.filter((lead) => lead.source.toLowerCase() === "whatsapp" && lead.stage === "CONVERTED").reduce((sum, lead) => sum + (lead.conversionValue || 0), 0);
  const invoiced = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const sourceCounts = [...new Set(leads.map((lead) => lead.source))].map((source) => ({ source, count: leads.filter((lead) => lead.source === source).length })).sort((a, b) => b.count - a.count);
  const lossCounts = [...new Set(leads.map((lead) => lead.lossReason).filter(Boolean) as string[])].map((reason) => ({ reason, count: leads.filter((lead) => lead.lossReason === reason).length })).sort((a, b) => b.count - a.count);
  const largestSource = Math.max(1, ...sourceCounts.map((item) => item.count));
  const funnel = [
    { label: "Enquiries", value: total, color: "bg-sky-500" },
    { label: "Appointments booked", value: booked, color: "bg-violet-500" },
    { label: "Visits completed", value: visited, color: "bg-amber-500" },
    { label: "Treatment conversions", value: converted, color: "bg-emerald-500" },
  ];
  const cards = [
    { label: "Enquiry to appointment", value: `${percentage(booked, total)}%`, help: `${booked} of ${total} enquiries booked`, icon: Target, tone: "bg-violet-50 text-violet-700" },
    { label: "Appointment to treatment", value: `${percentage(converted, booked)}%`, help: `${converted} converted from booked leads`, icon: TrendingUp, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Lost leads recovered", value: recovered.toString(), help: `${lost} leads currently marked lost`, icon: RefreshCcw, tone: "bg-cyan-50 text-cyan-700" },
    { label: "AI-attributed value", value: currency(aiValue), help: "WhatsApp conversions with staff-entered value", icon: CircleDollarSign, tone: "bg-amber-50 text-amber-800" },
  ];

  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">AI conversion coach</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Conversion intelligence</h1><p className="mt-2 max-w-2xl text-muted-foreground">See where enquiries come from, what converts, and which follow-ups bring patients back.</p></div><p className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">Live clinic data</p></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, help, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight">{value}</p></div><div className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></div></div><p className="mt-4 text-xs text-muted-foreground">{help}</p></article>)}</section>
    <section className="grid gap-5 lg:grid-cols-2"><article className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="flex items-center gap-2"><BarChart3 className="size-5 text-primary" /><h2 className="text-lg font-bold">Conversion funnel</h2></div><p className="mt-1 text-sm text-muted-foreground">Each stage is based on Lead CRM updates by your team.</p><div className="mt-6 space-y-5">{funnel.map((step, index) => <div key={step.label}><div className="flex justify-between gap-4 text-sm"><span className="font-semibold">{index + 1}. {step.label}</span><span className="text-muted-foreground">{step.value}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${step.color}`} style={{ width: `${percentage(step.value, total)}%` }} /></div></div>)}</div></article><article className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="flex items-center gap-2"><UserRoundCheck className="size-5 text-primary" /><h2 className="text-lg font-bold">Lead sources</h2></div><p className="mt-1 text-sm text-muted-foreground">Which channels are bringing enquiries into your clinic.</p><div className="mt-6 space-y-4">{sourceCounts.length === 0 ? <p className="text-sm text-muted-foreground">No leads recorded yet.</p> : sourceCounts.map((item) => <div key={item.source}><div className="flex justify-between text-sm"><span className="font-medium">{item.source}</span><span className="text-muted-foreground">{item.count}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / largestSource) * 100}%` }} /></div></div>)}</div></article></section>
    <section className="grid gap-5 lg:grid-cols-2"><article className="rounded-2xl border border-border bg-card p-6 shadow-sm"><h2 className="text-lg font-bold">Why leads are lost</h2><p className="mt-1 text-sm text-muted-foreground">Reasons entered by your staff when moving a lead to Lost.</p><div className="mt-6 space-y-3">{lossCounts.length === 0 ? <p className="text-sm text-muted-foreground">No loss reasons have been captured yet.</p> : lossCounts.map((item) => <div key={item.reason} className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-sm"><span className="font-medium text-rose-950">{item.reason}</span><span className="font-bold text-rose-700">{item.count}</span></div>)}</div></article><article className="rounded-2xl border border-border bg-card p-6 shadow-sm"><h2 className="text-lg font-bold">Financial context</h2><p className="mt-1 text-sm text-muted-foreground">Clinic billing totals alongside conversion value entered by staff.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-muted-foreground">Total invoiced</p><p className="mt-2 text-2xl font-bold">{currency(invoiced)}</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-sm text-emerald-800">Total collected</p><p className="mt-2 text-2xl font-bold text-emerald-800">{currency(collected)}</p></div></div><p className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-950"><strong>Accurate attribution:</strong> AI-attributed value only includes WhatsApp leads marked Converted with a value in Lead CRM. It is not an estimate.</p></article></section>
  </div>;
}
