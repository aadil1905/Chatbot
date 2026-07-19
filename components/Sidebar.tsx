"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  ClipboardList,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">
          🦷 DentalAI
        </h1>
        <p className="text-sm text-gray-500">
          Clinic Management
        </p>
      </div>

      <nav className="p-4 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-blue-50 transition"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/dashboard/appointments"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-blue-50 transition"
        >
          <ClipboardList size={20} />
          Appointments
        </Link>

        <Link
          href="/dashboard/patients"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-blue-50 transition"
        >
          <Users size={20} />
          Patients
        </Link>

        <Link
          href="/calendar"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-blue-50 transition"
        >
          <Calendar size={20} />
          Calendar
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-blue-50 transition"
        >
          <Settings size={20} />
          Settings
        </Link>
      </nav>
    </aside>
  );
}
