export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser(); const q = (await searchParams).q?.trim() || "";
  const [patients, appointments, leads, invoices] = q ? await Promise.all([
    prisma.patient.findMany({ where: { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }, take: 6 }),
    prisma.appointment.findMany({ where: { OR: [{ patientName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { treatment: { contains: q, mode: "insensitive" } }] }, take: 6 }),
    prisma.lead.findMany({ where: { clinicId: user.clinicId, OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }, take: 6 }),
    prisma.invoice.findMany({ where: { patient: { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] } }, include: { patient: true }, take: 6 }),
  ]) : [[], [], [], []];
  const results = [...patients.map((x) => ({ label: x.fullName, detail: `Patient · ${x.phone}`, href: `/dashboard/patients/${x.id}` })), ...appointments.map((x) => ({ label: x.patientName, detail: `Appointment · ${x.treatment}`, href: `/dashboard/appointments/${x.id}` })), ...leads.map((x) => ({ label: x.fullName, detail: `Lead · ${x.stage}`, href: "/dashboard/leads" })), ...invoices.map((x) => ({ label: x.invoiceNumber, detail: `Invoice · ${x.patient.fullName}`, href: `/dashboard/billing/${x.id}` }))];
  return <div className="mx-auto max-w-4xl"><h1 className="text-3xl font-bold">Search workspace</h1><form className="mt-5 flex gap-2"><input name="q" defaultValue={q} autoFocus placeholder="Search patients, appointments, leads or invoices" className="h-12 flex-1 rounded-xl border bg-white px-4 shadow-sm" /><button className="rounded-xl bg-primary px-5 font-semibold text-primary-foreground">Search</button></form><div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">{!q ? <p className="p-8 text-muted-foreground">Enter a name, phone number, treatment, or invoice detail.</p> : results.length ? <div className="divide-y">{results.map((item, index) => <Link key={`${item.href}-${index}`} href={item.href} className="block p-4 hover:bg-sky-50"><p className="font-semibold">{item.label}</p><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p></Link>)}</div> : <p className="p-8 text-muted-foreground">No results found for “{q}”.</p>}</div></div>;
}
