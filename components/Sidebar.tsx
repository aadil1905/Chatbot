"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BellRing,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessagesSquare,
  PackageCheck,
  ClipboardCheck,
  ReceiptIndianRupee,
  Settings,
  Stethoscope,
  Users,
  UserRoundPlus,
  Menu,
  X,
} from "lucide-react";

const navigationGroups = [
  { label: "Workspace", items: [
    { href: "/dashboard", label: "Today", icon: LayoutDashboard },
    { href: "/dashboard/conversations", label: "Inbox", icon: MessagesSquare },
    { href: "/dashboard/appointments", label: "Schedule", icon: CalendarDays },
    { href: "/dashboard/huddle", label: "Today’s priorities", icon: ClipboardCheck },
    { href: "/dashboard/patients", label: "Patients", icon: Users },
  ] },
  { label: "Patient care & revenue", items: [
    { href: "/dashboard/clinical-workspace", label: "Clinical", icon: Stethoscope },
    { href: "/dashboard/treatment-plans", label: "Treatment plans", icon: ClipboardList },
    { href: "/dashboard/billing", label: "Revenue", icon: ReceiptIndianRupee },
  ] },
  { label: "Manage", items: [
    { href: "/dashboard/leads", label: "Leads", icon: UserRoundPlus },
    { href: "/dashboard/follow-ups", label: "Work queue", icon: BellRing },
    { href: "/dashboard/operations", label: "Operations", icon: PackageCheck },
    { href: "/dashboard/analytics", label: "Reports", icon: BarChart3 },
  ] },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const prefetchTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (prefetchTimer.current) window.clearTimeout(prefetchTimer.current);
    };
  }, []);

  const prefetchOnIntent = (href: string) => {
    if (prefetchTimer.current) window.clearTimeout(prefetchTimer.current);
    prefetchTimer.current = window.setTimeout(() => router.prefetch(href), 70);
  };

  const cancelPrefetch = () => {
    if (prefetchTimer.current) {
      window.clearTimeout(prefetchTimer.current);
      prefetchTimer.current = null;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-[70] inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/95 text-slate-800 shadow-lg shadow-slate-900/10 backdrop-blur transition hover:bg-slate-50"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-[75] bg-slate-950/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[80] flex h-screen w-[min(88vw,320px)] shrink-0 flex-col border-r border-slate-200 bg-white shadow-2xl shadow-slate-900/20 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >

      {/* =================== HEADER =================== */}

      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">

          <Image
            src="/dental/dental-white-logo.png"
            alt="Dental White"
            width={56}
            height={56}
            className="h-14 w-14 rounded-2xl object-contain"
            draggable={false}
          />

          <div className="leading-tight">

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
              DR. DEEPIKA&apos;S
            </p>

            <h2 className="text-xl font-black tracking-tight text-slate-900">
              DENTAL WHITE
            </h2>

          </div>

        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* =================== NAVIGATION =================== */}

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {navigationGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
            {group.items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);

              return (
            <Link
              key={href}
              href={href}
              prefetch={null}
              onMouseEnter={() => prefetchOnIntent(href)}
              onMouseLeave={cancelPrefetch}
              onFocus={() => router.prefetch(href)}
              onClick={() => setOpen(false)}
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
          </div>
        ))}
      </nav>

      {/* =================== FOOTER =================== */}

      <div className="border-t border-slate-200 p-4">

        {role === "OWNER" && (
          <Link
            href="/dashboard/settings"
            prefetch={null}
            onMouseEnter={() => prefetchOnIntent("/dashboard/settings")}
            onMouseLeave={cancelPrefetch}
            onFocus={() => router.prefetch("/dashboard/settings")}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings className="h-5 w-5" />
            Clinic settings
          </Link>
        )}

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xs font-semibold text-slate-500">
            DR. DEEPIKA&apos;S DENTAL WHITE
          </p>
        </div>

      </div>

      </aside>
    </>
  );
}
