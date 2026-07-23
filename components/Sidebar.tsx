"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BellRing, BotMessageSquare, CalendarDays, ClipboardList, CircleHelp, Download, LayoutDashboard, MessagesSquare, PackageCheck, ReceiptIndianRupee, Settings, Stethoscope, Sparkles, Users, UserRoundPlus, Pill } from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Lead CRM", icon: UserRoundPlus },
  { href: "/dashboard/ai-coach", label: "AI Coach", icon: BotMessageSquare },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/dashboard/appointments", label: "Appointments", icon: ClipboardList },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/clinical-records", label: "Clinical records", icon: Stethoscope },
  { href: "/dashboard/prescriptions/new", label: "Prescriptions", icon: Pill },
  { href: "/dashboard/clinical-workspace", label: "Clinical workspace", icon: Stethoscope },
  { href: "/dashboard/treatment-plans", label: "Treatment plans", icon: ClipboardList },
  { href: "/dashboard/billing", label: "Billing", icon: ReceiptIndianRupee },
  { href: "/dashboard/operations", label: "Inventory & labs", icon: PackageCheck },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: BellRing },
  { href: "/dashboard/exports", label: "Exports", icon: Download },
  { href: "/dashboard/help", label: "Help", icon: CircleHelp },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-sky-100 bg-white/80 text-slate-700 backdrop-blur-xl lg:flex">
    <div className="border-b border-sky-100 px-7 py-7">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-white shadow-lg shadow-sky-200"><Sparkles className="size-6" /></div>
        <div><p className="text-xl font-bold tracking-tight text-slate-900">DentalAI</p><p className="text-xs font-medium text-slate-500">Clinic intelligence</p></div>
      </Link>
    </div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-gradient-to-r from-indigo-50 to-sky-100 text-indigo-700 shadow-sm ring-1 ring-sky-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><Icon className="size-5" />{label}</Link>;
      })}
    </nav>
    <div className="border-t border-sky-100 p-4">
      {role === "OWNER" && <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"><Settings className="size-5" />Clinic settings</Link>}
      <p className="px-4 pt-4 text-xs font-medium text-slate-400">DentalAI Premium v1.0</p>
    </div>
  </aside>;
}
