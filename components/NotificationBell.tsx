"use client";

import Link from "next/link";
import { Bell, ChevronRight, X } from "lucide-react";
import { useState } from "react";

export type DashboardNotification = {
  label: string;
  detail: string;
  href: string;
};

export default function NotificationBell({ items }: { items: DashboardNotification[] }) {
  const [open, setOpen] = useState(false);
  const count = items.length;

  return <div className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Open notifications" className="relative grid size-11 place-items-center rounded-2xl border border-sky-100 bg-white text-slate-600 shadow-sm transition hover:bg-sky-50"><Bell className="size-5" />{count > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{count > 9 ? "9+" : count}</span>}</button>
    {open && <div className="absolute right-0 top-14 z-30 w-80 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-sky-100 px-4 py-3"><div><p className="font-bold text-slate-950">Notifications</p><p className="text-xs text-slate-500">Items that need your attention</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X className="size-4" /></button></div>{count === 0 ? <p className="p-4 text-sm text-slate-600">You are all caught up.</p> : <div className="max-h-80 overflow-y-auto p-2">{items.map((item) => <Link key={`${item.href}-${item.label}`} href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-sky-50"><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{item.label}</span><span className="block truncate text-xs text-slate-500">{item.detail}</span></span><ChevronRight className="size-4 shrink-0 text-sky-700" /></Link>)}</div>}</div>}
  </div>;
}
