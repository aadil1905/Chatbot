"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BellRing, CalendarDays, ClipboardList, LayoutDashboard, ReceiptIndianRupee, Settings, Stethoscope, Users } from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Appointments", icon: ClipboardList },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/clinical-records", label: "Clinical records", icon: Stethoscope },
  { href: "/dashboard/treatment-plans", label: "Treatment plans", icon: ClipboardList },
  { href: "/dashboard/billing", label: "Billing", icon: ReceiptIndianRupee },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: BellRing },
];

export default function Sidebar() {
  const pathname = usePathname();
  return <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[linear-gradient(180deg,#172f52_0%,#10233f_100%)] text-slate-100 lg:flex"><div className="border-b border-white/10 px-7 py-8"><Link href="/dashboard" className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-cyan-300 text-xl shadow-lg shadow-cyan-950/30">🦷</div><div><p className="text-lg font-bold tracking-tight text-white">DentalAI</p><p className="text-xs text-slate-300">Clinic intelligence</p></div></Link></div><nav className="flex-1 space-y-1 px-4 py-6">{navigation.map(({ href, label, icon: Icon }) => { const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active ? "bg-cyan-300 text-slate-950 shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon className="size-5" />{label}</Link>; })}</nav><div className="border-t border-white/10 p-4"><Link href="/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"><Settings className="size-5" /> Settings</Link><p className="px-4 pt-4 text-xs text-slate-400">DentalAI Standard v1.0</p></div></aside>;
}
