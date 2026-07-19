export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentPagination from "@/components/appointments/AppointmentPagination";
import StatusBadge from "@/components/appointments/StatusBadge";

const PAGE_SIZE = 10;
const sortOptions = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  dateAsc: { appointmentDate: "asc" },
  dateDesc: { appointmentDate: "desc" },
} as const;

type SearchParams = Promise<{
  search?: string;
  status?: string;
  sort?: keyof typeof sortOptions;
  page?: string;
}>;

export default async function AppointmentsPage({ searchParams }: { searchParams: SearchParams }) {
  const { search = "", status = "", sort = "dateAsc", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
  const activeSort = sort in sortOptions ? sort : "dateAsc";
  const where = {
    ...(search.trim() && {
      OR: [
        { patientName: { contains: search.trim(), mode: "insensitive" as const } },
        { phone: { contains: search.trim() } },
        { treatment: { contains: search.trim(), mode: "insensitive" as const } },
      ],
    }),
    ...(status && { status }),
  };

  const [total, appointments] = await prisma.$transaction([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      orderBy: sortOptions[activeSort],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="mt-1 text-muted-foreground">Manage bookings created by your clinic and WhatsApp concierge.</p>
        </div>
        <Link href="/dashboard/appointments/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          <Plus className="size-4" /> New appointment
        </Link>
      </div>

      <AppointmentFilters />

      <Card>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="text-lg font-semibold">No appointments found</div>
              <p className="max-w-sm text-sm text-muted-foreground">Try clearing a filter or create a new appointment to get started.</p>
              <Link href="/dashboard/appointments/new" className="text-sm font-medium text-primary hover:underline">Create appointment</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                    <tr>
                      <th className="p-4 font-medium">Patient</th><th className="p-4 font-medium">Phone</th><th className="p-4 font-medium">Date & time</th><th className="p-4 font-medium">Treatment</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium">{appointment.patientName}</td>
                        <td className="p-4 text-muted-foreground">{appointment.phone}</td>
                        <td className="p-4"><div>{appointment.appointmentDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</div><div className="text-muted-foreground">{appointment.appointmentTime}</div></td>
                        <td className="p-4">{appointment.treatment}</td>
                        <td className="p-4"><StatusBadge status={appointment.status as "Pending" | "Confirmed" | "Completed" | "Cancelled"} /></td>
                        <td className="p-4 text-right"><Link href={`/dashboard/appointments/${appointment.id}`} className="font-medium text-primary hover:underline">View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AppointmentPagination page={Math.min(page, totalPages)} totalPages={totalPages} total={total} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
