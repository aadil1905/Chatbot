"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: Appointment["status"]) {
    try {
      setLoading(true);

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

      toast.success(`Appointment marked as ${status}.`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update appointment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <EditAppointmentDialog appointment={appointment} />
      <SendReminderButton appointmentId={appointment.id} sentAt={reminderSentAt ?? null} />

      <Button
        onClick={() => updateStatus("Confirmed")}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700"
      >
        Confirm
      </Button>

      <Button
        onClick={() => updateStatus("Completed")}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Complete
      </Button>

      <Button
        onClick={() => updateStatus("Cancelled")}
        disabled={loading}
        className="bg-yellow-600 hover:bg-yellow-700 text-black"
      >
        Cancel
      </Button>

      <DeleteAppointmentDialog
        appointmentId={appointment.id}
      />
    </div>
  );
}
