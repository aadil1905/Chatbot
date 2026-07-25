"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BellRing,
  BotMessageSquare,
  CalendarDays,
  ClipboardList,
  CircleHelp,
  Download,
  LayoutDashboard,
  MessagesSquare,
  PackageCheck,
  ReceiptIndianRupee,
  Settings,
  Stethoscope,
  Users,
  UserRoundPlus,
  Pill,
} from "lucide-react";

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

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">

      {/* =================== HEADER =================== */}

      <div className="border-b border-slate-200 px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">

          <img
            src="/dental/dental-white-logo.png"
            alt="Dental White"
            className="h-14 w-14 rounded-2xl object-contain"
            draggable={false}
          />

          <div className="leading-tight">

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
              DR. DEEPIKA'S
            </p>

            <h2 className="text-xl font-black tracking-tight text-slate-900">
              DENTAL WHITE
            </h2>

          </div>

        </Link>
      </div>

      {/* =================== NAVIGATION =================== */}

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-indigo-50 to-sky-100 text-indigo-700 shadow-sm ring-1 ring-sky-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* =================== FOOTER =================== */}

      <div className="border-t border-slate-200 p-4">

        {role === "OWNER" && (
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings className="h-5 w-5" />
            Clinic settings
          </Link>
        )}

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xs font-semibold text-slate-500">
            DR. DEEPIKA'S DENTAL WHITE
          </p>
        </div>

      </div>

    </aside>
  );
}