"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Check, CircleCheckBig, LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import EditAppointmentDialog from "./EditAppointmentDialog";
import DeleteAppointmentDialog from "./DeleteAppointmentDialog";
import SendReminderButton from "./SendReminderButton";

import type { Appointment } from "@/types/appointment";

type Props = {
  appointment: Appointment;
  reminderSentAt?: string | null;
};

export default function AppointmentActions({
  appointment,
  reminderSentAt,
}: Props) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<Appointment["status"] | null>(null);

  async function updateStatus(status: Appointment["status"]) {
    try {
      setPendingStatus(status);

      const response = await fetch(
        `/api/appointments/${appointment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      toast.success(
        status === "Completed"
          ? "Appointment completed. Patient saved to Patients list."
          : `Appointment marked as ${status}.`
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update appointment.");
    } finally {
      setPendingStatus(null);
    }
  }

  const statusButtonContent = (
    status: Appointment["status"],
    label: string,
    icon: React.ReactNode,
  ) => pendingStatus === status ? (
    <>
    
      <LoaderCircle className="size-4 animate-spin" /> Updating...
    </>
  ) : (
    <>
      {icon} {label}
    </>
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <EditAppointmentDialog appointment={appointment} />
      <SendReminderButton appointmentId={appointment.id} sentAt={reminderSentAt ?? null} />

      <Button
        onClick={() => updateStatus("Confirmed")}
        disabled={pendingStatus !== null}
        className="h-11 rounded-xl bg-emerald-600 px-5 font-bold hover:bg-emerald-700"
      >
        {statusButtonContent("Confirmed", "Confirm", <Check className="size-4" />)}
      </Button>

      <Button
        onClick={() => updateStatus("Completed")}
        disabled={pendingStatus !== null}
        className="h-11 rounded-xl bg-blue-600 px-5 font-bold hover:bg-blue-700"
      >
        {statusButtonContent("Completed", "Complete", <CircleCheckBig className="size-4" />)}
      </Button>

      <Button
        onClick={() => updateStatus("Cancelled")}
        disabled={pendingStatus !== null}
        className="h-11 rounded-xl bg-amber-500 px-5 font-bold text-slate-950 hover:bg-amber-600"
      >
        {statusButtonContent("Cancelled", "Cancel", <X className="size-4" />)}
      </Button>

      <DeleteAppointmentDialog
        appointmentId={appointment.id}
      />
    </div>
  );
}
