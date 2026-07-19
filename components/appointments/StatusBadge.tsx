import type { AppointmentStatus } from "@/types/appointment";

type Props = {
  status: AppointmentStatus;
};

const statusStyles: Record<AppointmentStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-green-100 text-green-800",
  Completed: "bg-blue-100 text-blue-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}