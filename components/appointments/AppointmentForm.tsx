"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import { CalendarPlus, Loader2 } from "lucide-react";

import { appointmentSchema } from "@/lib/validations";
import type { AppointmentFormValues } from "@/lib/validations";

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

type AppointmentFormProps = {
  defaultValues?: Partial<AppointmentFormValues>;
  appointmentId?: number;
  mode?: "create" | "edit";
};

export default function AppointmentForm({
  defaultValues,
  appointmentId,
  mode = "create",
}: AppointmentFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),

    defaultValues: {
      patientName: defaultValues?.patientName ?? "",
      phone: defaultValues?.phone ?? "",

     appointmentDate:
  defaultValues?.appointmentDate ?? "",

      appointmentTime:
        defaultValues?.appointmentTime ?? "",

      treatment:
        defaultValues?.treatment === "Follow up" ? "Follow up" : defaultValues?.treatment === "New Consultation" ? "New Consultation" : "New Consultation",

      status:
        defaultValues?.status ?? "Pending",

      notes:
        defaultValues?.notes ?? "",
    },
  });

  useEffect(() => {
    register("status");
  }, [register]);

  const status = useWatch({ control, name: "status" });
  const treatment = useWatch({ control, name: "treatment" });

  async function onSubmit(
    values: AppointmentFormValues
  ) {
    try {
      setLoading(true);

      const url =
        mode === "create"
          ? "/api/appointments"
          : `/api/appointments/${appointmentId}`;

      const method =
        mode === "create"
          ? "POST"
          : "PATCH";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(
          "Failed to save appointment."
        );
      }
      const saved = await response.json();

      toast.success(
        mode === "create"
          ? "Appointment created successfully."
          : "Appointment updated successfully."
      );

      if (mode === "create" && saved.intakeRequired) {
        const query = new URLSearchParams({
          name: values.patientName,
          phone: values.phone.replace(/\D/g, "").slice(-10),
        });
        router.push(`/dashboard/patient-intake?${query.toString()}`);
      } else {
        router.push("/dashboard/appointments");
      }

      router.refresh();
          } catch (error) {
      console.error(error);

      toast.error(
        mode === "create"
          ? "Failed to create appointment."
          : "Failed to update appointment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm"
    >
      <div className="border-b border-border bg-gradient-to-r from-sky-50 to-white px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700"><CalendarPlus className="size-5" /></div>
          <div><h2 className="text-lg font-bold text-slate-950">Appointment details</h2><p className="mt-1 text-sm text-muted-foreground">Add the patient, schedule, visit reason, and booking status.</p></div>
        </div>
      </div>
      <div className="space-y-6 p-6">
      <div className="grid gap-5 md:grid-cols-2">

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">
            Patient name <span className="text-red-500">*</span>
          </label>

          <Input
            placeholder="John Doe"
            className="h-11 rounded-xl bg-white"
            {...register("patientName")}
          />

          {errors.patientName && (
            <p className="text-sm text-destructive">
              {errors.patientName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">
            Phone number <span className="text-red-500">*</span>
          </label>

          <Input
            placeholder="10-digit mobile number"
            className="h-11 rounded-xl bg-white"
            {...register("phone")}
          />

          {errors.phone && (
            <p className="text-sm text-destructive">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">
            Appointment date <span className="text-red-500">*</span>
          </label>

          <Input
  type="date"
  lang="en-CA"
  className="h-11 rounded-xl bg-white"
  {...register("appointmentDate")}
/>
          {errors.appointmentDate && (
            <p className="text-sm text-destructive">
              {errors.appointmentDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">
            Appointment time <span className="text-red-500">*</span>
          </label>

          <Input
  type="time"
  className="h-11 rounded-xl bg-white"
  {...register("appointmentTime")}
/>

          {errors.appointmentTime && (
            <p className="text-sm text-destructive">
              {errors.appointmentTime.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">
            Reason for visit
          </label>

          <Select
            value={treatment}
            onValueChange={(value) =>
              setValue("treatment", value as AppointmentFormValues["treatment"], {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger className="h-11 w-full rounded-xl bg-white">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New Consultation">
                New Consultation
              </SelectItem>
              <SelectItem value="Follow up">
                Follow up
              </SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register("treatment")} />

          {errors.treatment && (
            <p className="text-sm text-destructive">
              {errors.treatment.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">
            Status
          </label>

          <Select
            value={status}
            onValueChange={(value) =>
              setValue(
                "status",
                value as AppointmentFormValues["status"],
                {
                  shouldValidate: true,
                  shouldDirty: true,
                }
              )
            }
          >
            <SelectTrigger className="h-11 w-full rounded-xl bg-white">
              <SelectValue placeholder="Select status" />
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

          <input
            type="hidden"
            {...register("status")}
          />

          {errors.status && (
            <p className="text-sm text-destructive">
              {errors.status.message}
            </p>
          )}
        </div>
      </div>
            <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800">
          Notes
        </label>

        <Textarea
          rows={5}
          placeholder="Additional notes about the appointment..."
          className="rounded-xl bg-white"
          {...register("notes")}
        />

        {errors.notes && (
          <p className="text-sm text-destructive">
            {errors.notes.message}
          </p>
        )}
      </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          className="h-11 rounded-xl px-5"
          onClick={() =>
            router.push("/dashboard/appointments")
          }
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl px-6"
        >
          {loading ? <><Loader2 className="size-4 animate-spin" />{mode === "create" ? "Creating appointment..." : "Saving changes..."}</> :
            mode === "create"
              ? "Create Appointment"
              : "Save Changes"}
        </Button>
      </div>
    </form>
      );
}
