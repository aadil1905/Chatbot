import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppointmentActions from "@/components/appointments/AppointmentActions";
import StatusBadge from "@/components/appointments/StatusBadge";
import type { AppointmentStatus } from "@/types/appointment";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AppointmentDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!appointment) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">
          Appointment not found
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Appointment Details
          </h1>
          <p className="text-gray-500">
            View and manage appointment information
          </p>
        </div>

        <Link
          href="/dashboard/appointments"
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
        >
          ← Back
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="font-semibold text-lg mb-6">
            Patient Information
          </h2>

          <div className="space-y-5">

            <div>
              <p className="text-sm text-gray-500">
                Patient Name
              </p>

              <p className="font-semibold text-lg">
                {appointment.patientName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Phone
              </p>

              <p>{appointment.phone}</p>
            </div>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="font-semibold text-lg mb-6">
            Appointment
          </h2>

          <div className="space-y-5">

            <div>
              <p className="text-sm text-gray-500">
                Date
              </p>

              <p>
                {appointment.appointmentDate.toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Time
              </p>

              <p>{appointment.appointmentTime}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Treatment
              </p>

              <p>{appointment.treatment}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <StatusBadge
status={appointment.status as AppointmentStatus}              />
            </div>

          </div>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-lg font-semibold mb-5">
          Actions
        </h2>

        <AppointmentActions
          appointment={{
            id: appointment.id,
            patientName: appointment.patientName,
            phone: appointment.phone,
            appointmentDate:
              appointment.appointmentDate.toISOString(),
            appointmentTime:
              appointment.appointmentTime,
            treatment: appointment.treatment,
            status: appointment.status as AppointmentStatus,
            notes: appointment.notes,
          }}
        />

      </div>

    </div>
  );
}