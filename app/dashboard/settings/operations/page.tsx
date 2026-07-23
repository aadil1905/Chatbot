import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buildTimeSlots, defaultHours } from "@/lib/clinic-config";
import { addServiceAction, saveHoursAction, saveWhatsAppCopyAction, toggleServiceAction, updateServiceAction } from "./actions";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function OperationsSettingsPage() {
  const user = await requireUser();
  if (user.role !== "OWNER") redirect("/dashboard");

  const [services, hours, whatsapp] = await Promise.all([
    prisma.clinicService.findMany({ where: { clinicId: user.clinicId }, orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { name: "asc" }] }),
    prisma.clinicHours.findMany({ where: { clinicId: user.clinicId }, orderBy: { dayOfWeek: "asc" } }),
    prisma.clinicWhatsAppSettings.findUnique({ where: { clinicId: user.clinicId } }),
  ]);
  const hourByDay = new Map(hours.map((hour) => [hour.dayOfWeek, hour]));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">Premium operations</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Services, hours & WhatsApp</h1><p className="mt-2 text-muted-foreground">These details power dashboard pricing, appointment availability, and the WhatsApp booking experience.</p></div>
        <Link href="/dashboard/settings" className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">Back to settings</Link>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold">Clinic services & prices</h2><p className="mt-1 text-sm text-muted-foreground">Only active services are shown when a patient books through WhatsApp.</p>
        <form action={addServiceAction} className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input name="name" required placeholder="Service name" className="h-11 rounded-xl border px-3" /><input name="description" placeholder="Short description" className="h-11 rounded-xl border px-3" /><input name="durationMinutes" type="number" min="15" step="15" defaultValue="30" className="h-11 rounded-xl border px-3" /><input name="price" type="number" min="0" step="1" placeholder="Price (optional)" className="h-11 rounded-xl border px-3" />
          <button className="h-11 rounded-xl bg-sky-700 px-5 font-semibold text-white hover:bg-sky-800">Add service</button>
        </form>
        <div className="mt-5 divide-y rounded-xl border">
          {services.length ? services.map((service) => <div key={service.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{service.name} {!service.active && <span className="ml-2 text-xs text-muted-foreground">Inactive</span>}</p><p className="text-sm text-muted-foreground">{service.description || "No description"} · {service.durationMinutes} min{service.price !== null ? ` · ₹${service.price}` : ""}</p></div><form action={toggleServiceAction}><input type="hidden" name="id" value={service.id} /><input type="hidden" name="active" value={String(!service.active)} /><button className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">{service.active ? "Hide from WhatsApp" : "Make active"}</button></form></div>
            <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-sky-700">Edit service details</summary><form action={updateServiceAction} className="mt-3 grid gap-3 border-t pt-3 md:grid-cols-2 lg:grid-cols-4"><input type="hidden" name="id" value={service.id} /><input name="name" required defaultValue={service.name} className="h-11 rounded-xl border px-3" /><input name="description" defaultValue={service.description ?? ""} className="h-11 rounded-xl border px-3" /><input name="durationMinutes" type="number" min="15" step="15" defaultValue={service.durationMinutes} className="h-11 rounded-xl border px-3" /><input name="price" type="number" min="0" step="1" defaultValue={service.price ?? ""} className="h-11 rounded-xl border px-3" /><button className="h-11 rounded-xl bg-slate-900 px-5 font-semibold text-white hover:bg-slate-700">Save service</button></form></details>
          </div>) : <p className="p-4 text-sm text-muted-foreground">No services added yet. Add your first service above.</p>}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold">Working hours and booking slots</h2><p className="mt-1 text-sm text-muted-foreground">A closed day cannot be booked on WhatsApp. The slot preview updates after you save.</p>
        <div className="mt-5 space-y-3">{defaultHours.map((fallback) => { const hour = hourByDay.get(fallback.dayOfWeek) || fallback; const slots = hour.isClosed ? [] : buildTimeSlots(hour.openTime, hour.closeTime, hour.slotMinutes); return <form key={fallback.dayOfWeek} action={saveHoursAction} className="grid items-end gap-3 rounded-xl border p-3 md:grid-cols-[130px_1fr_1fr_120px_100px_auto]"><input type="hidden" name="dayOfWeek" value={fallback.dayOfWeek} /><div><span className="font-semibold">{days[fallback.dayOfWeek]}</span><p className="mt-1 text-xs text-muted-foreground">{hour.isClosed ? "Closed" : slots.slice(0, 3).join(" · ") + (slots.length > 3 ? " …" : "")}</p></div><label className="text-sm">Open<input name="openTime" type="time" defaultValue={hour.openTime} className="mt-1 h-10 w-full rounded-lg border px-2" /></label><label className="text-sm">Close<input name="closeTime" type="time" defaultValue={hour.closeTime} className="mt-1 h-10 w-full rounded-lg border px-2" /></label><label className="text-sm">Slot min<input name="slotMinutes" type="number" min="15" step="15" defaultValue={hour.slotMinutes} className="mt-1 h-10 w-full rounded-lg border px-2" /></label><label className="flex h-10 items-center gap-2 text-sm font-semibold"><input name="isClosed" type="checkbox" value="true" defaultChecked={hour.isClosed} /> Closed</label><button className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700">Save</button></form>; })}</div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold">WhatsApp clinic messages</h2><p className="mt-1 text-sm text-muted-foreground">Personalize welcome, booking, and contact messages. Empty welcome fields use the standard translation.</p>
        <form action={saveWhatsAppCopyAction} className="mt-5 grid gap-4">
          <label className="text-sm font-semibold">English welcome<textarea name="welcomeEnglish" defaultValue={whatsapp?.welcomeEnglish ?? ""} className="mt-1.5 min-h-20 w-full rounded-xl border p-3 font-normal" placeholder={`Welcome to ${user.clinic.name}. How can we help you today?`} /></label>
          <label className="text-sm font-semibold">Hindi welcome<textarea name="welcomeHindi" defaultValue={whatsapp?.welcomeHindi ?? ""} className="mt-1.5 min-h-20 w-full rounded-xl border p-3 font-normal" /></label>
          <label className="text-sm font-semibold">Marathi welcome<textarea name="welcomeMarathi" defaultValue={whatsapp?.welcomeMarathi ?? ""} className="mt-1.5 min-h-20 w-full rounded-xl border p-3 font-normal" /></label>
          <label className="text-sm font-semibold">Booking introduction<textarea name="bookingIntro" defaultValue={whatsapp?.bookingIntro ?? ""} className="mt-1.5 min-h-20 w-full rounded-xl border p-3 font-normal" placeholder="Great! Let us book your appointment. Please enter your full name." /></label>
          <label className="text-sm font-semibold">Contact message<textarea name="contactMessage" defaultValue={whatsapp?.contactMessage ?? ""} className="mt-1.5 min-h-20 w-full rounded-xl border p-3 font-normal" placeholder="Our clinic contact details and opening hours." /></label>
          <button className="h-11 w-fit rounded-xl bg-sky-700 px-5 font-semibold text-white hover:bg-sky-800">Save WhatsApp messages</button>
        </form>
      </section>
    </div>
  );
}
