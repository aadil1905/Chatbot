"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  appointmentId: number;
};

export default function DeleteAppointmentDialog({
  appointmentId,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function deleteAppointment() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to archive appointment");
      }

      toast.success("Appointment archived. Patient records are unchanged.");

      setOpen(false);

      router.push("/dashboard/appointments");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to archive appointment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 rounded-xl bg-slate-700 px-5 text-sm font-bold hover:bg-slate-800"
      >
        Archive
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive Appointment</DialogTitle>

          <DialogDescription>
            This removes the appointment from the active list while keeping its
            history, patient profile, and medical records.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={deleteAppointment}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-800"
          >
            {loading ? "Archiving..." : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
