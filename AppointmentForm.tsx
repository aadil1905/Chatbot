"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

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
    handleSubmit,
    setValue,
    watch,
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
        defaultValues?.treatment ?? "",

      status:
        defaultValues?.status ?? "Pending",

      notes:
        defaultValues?.notes ?? "",
    },
  });

  useEffect(() => {
    register("status");
  }, [register]);

  const status = watch("status");

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

      toast.success(
        mode === "create"
          ? "Appointment created successfully."
          : "Appointment updated successfully."
      );

      router.push("/dashboard/appointments");

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
      className="space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Patient Name
          </label>

          <Input
            placeholder="John Doe"
            {...register("patientName")}
          />

          {errors.patientName && (
            <p className="text-sm text-destructive">
              {errors.patientName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Phone Number
          </label>

          <Input
            placeholder="+1 555 123 4567"
            {...register("phone")}
          />

          {errors.phone && (
            <p className="text-sm text-destructive">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Appointment Date
          </label>

          <Input
  type="date"
  lang="en-CA"
  {...register("appointmentDate")}
/>
          {errors.appointmentDate && (
            <p className="text-sm text-destructive">
              {errors.appointmentDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Appointment Time
          </label>

          <Input
  type="time"
  {...register("appointmentTime")}
/>

          {errors.appointmentTime && (
            <p className="text-sm text-destructive">
              {errors.appointmentTime.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Treatment
          </label>

          <Input
            placeholder="Root Canal"
            {...register("treatment")}
          />

          {errors.treatment && (
            <p className="text-sm text-destructive">
              {errors.treatment.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
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
            <SelectTrigger className="w-full">
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
        <label className="text-sm font-medium">
          Notes
        </label>

        <Textarea
          rows={5}
          placeholder="Additional notes about the appointment..."
          {...register("notes")}
        />

        {errors.notes && (
          <p className="text-sm text-destructive">
            {errors.notes.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() =>
            router.push("/dashboard/appointments")
          }
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Appointment"
              : "Save Changes"}
        </Button>
      </div>
    </form>
      );
}