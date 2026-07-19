export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import AppointmentSearch from "@/components/AppointmentSearch";
import Link from "next/link";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}) {

  const {
    search = "",
    status = "",
  } = await searchParams;

 const appointments = await prisma.appointment.findMany({
  where: {
    ...(search && {
      OR: [
        {
          patientName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search,
          },
          
        },
        {
  treatment: {
    contains: search,
    mode: "insensitive",
  },
},
      ],
    }),

    ...(status && {
      status,
    }),
  },

  orderBy: {
    createdAt: "desc",
  },
});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-gray-500">
          Live appointments from Supabase
        </p>
      </div>

<AppointmentSearch />

      <Card>
        <CardContent className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Patient</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Treatment</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
  {appointments.length === 0 ? (
    <tr>
      <td
        colSpan={6}
        className="text-center p-6 text-gray-500"
      >
        No appointments found.
      </td>
    </tr>
  ) : (
    appointments.map((appointment) => (
      <tr
  key={appointment.id}
  className="border-b hover:bg-gray-50 transition-colors"
>
        <td className="p-3">{appointment.patientName}</td>
        <td className="p-3">{appointment.phone}</td>
        <td className="p-3">
          {appointment.appointmentDate.toLocaleDateString()}
        </td>
        <td className="p-3">{appointment.appointmentTime}</td>
        <td className="p-3">{appointment.treatment}</td>
       <td className="p-3">
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      appointment.status === "Pending"
        ? "bg-yellow-100 text-yellow-800"
        : appointment.status === "Confirmed"
        ? "bg-blue-100 text-blue-800"
        : appointment.status === "Completed"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
    }`}
  >
    {appointment.status}
  </span>
</td>

<td className="p-3">
  <Link
    href={`/dashboard/appointments/${appointment.id}`}
    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
  >
    View
  </Link>
</td>

      </tr>
    ))
  )}
</tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}