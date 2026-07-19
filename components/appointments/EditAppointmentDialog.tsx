"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Appointment = {
  id: number;
  patientName: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  treatment: string;
  status: string;
  notes: string | null;
};

type Props = {
  appointment: Appointment;
};

export default function EditAppointmentDialog({
  appointment,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [patientName, setPatientName] = useState(
    appointment.patientName
  );

  const [phone, setPhone] = useState(appointment.phone);

  const [appointmentDate, setAppointmentDate] = useState(
    appointment.appointmentDate.slice(0, 10)
  );

  const [appointmentTime, setAppointmentTime] = useState(
    appointment.appointmentTime
  );

  const [treatment, setTreatment] = useState(
    appointment.treatment
  );

  const [status, setStatus] = useState(
    appointment.status
  );

  const [notes, setNotes] = useState(
    appointment.notes ?? ""
  );

  async function saveAppointment() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/appointments/${appointment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientName,
            phone,
            appointmentDate,
            appointmentTime,
            treatment,
            status,
            notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed");
      }

      toast.success("Appointment updated successfully.");

      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);

      toast.error("Failed to update appointment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={<Button variant="outline">Edit</Button>}
      />

      <DialogContent className="sm:max-w-xl">

        <DialogHeader>
          <DialogTitle>
            Edit Appointment
          </DialogTitle>

          <DialogDescription>
            Update the appointment details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          <Input
            value={patientName}
            onChange={(e) =>
              setPatientName(e.target.value)
            }
            placeholder="Patient Name"
          />

          <Input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Phone Number"
          />

          <div className="grid grid-cols-2 gap-4">

            <Input
              type="date"
              value={appointmentDate}
              onChange={(e) =>
                setAppointmentDate(e.target.value)
              }
            />

            <Input
              value={appointmentTime}
              onChange={(e) =>
                setAppointmentTime(e.target.value)
              }
              placeholder="10:30 AM"
            />

          </div>

          <Input
            value={treatment}
            onChange={(e) =>
              setTreatment(e.target.value)
            }
            placeholder="Treatment"
          />

          <Select
            value={status}
            onValueChange={(value) => {
  if (value) {
    setStatus(value);
  }
}}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="Pending">
                Pending
              </SelectItem>

              <SelectItem value="Confirmed">
                Confirmed
              </SelectItem>

              <SelectItem value="Completed">
                Completed
              </SelectItem>

              <SelectItem value="Cancelled">
                Cancelled
              </SelectItem>

            </SelectContent>
          </Select>

          <Textarea
            rows={4}
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            placeholder="Notes..."
          />

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={saveAppointment}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Changes"}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
