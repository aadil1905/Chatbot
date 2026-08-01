import Link from "next/link";

export default function EditAppointmentButton({ appointmentId }: { appointmentId: number }) {
  return (
    <Link
      href={`/dashboard/appointments/${appointmentId}/edit`}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-sky-700"
    >
      Edit appointment
    </Link>
  );
}
