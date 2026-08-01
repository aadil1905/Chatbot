"use client";

import { AlertCircle, CheckCircle2, Loader2, UserRoundPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Values = {
  fullName: string;
  phone: string;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  medicalNotes?: string | null;
};

type PatientResponse = {
  id?: number;
  existed?: boolean;
  error?: string;
  issues?: {
    fieldErrors?: Record<string, string[]>;
  };
};

function firstIssue(body: PatientResponse) {
  const fields = body.issues?.fieldErrors;
  return fields ? Object.values(fields).flat()[0] : null;
}

function normalizePhone(value: FormDataEntryValue | null) {
  return String(value || "").replace(/\D/g, "").slice(-10);
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

export default function PatientForm({
  patient,
  mode = "create",
}: {
  patient?: Values & { id: number };
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const title = useMemo(
    () => (mode === "create" ? "Add patient" : "Save changes"),
    [mode],
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const form = new FormData(event.currentTarget);
    const data = {
      fullName: normalizeText(form.get("fullName")),
      phone: normalizePhone(form.get("phone")),
      email: normalizeText(form.get("email")),
      dateOfBirth: normalizeText(form.get("dateOfBirth")),
      gender: normalizeText(form.get("gender")),
      address: normalizeText(form.get("address")),
      medicalNotes: normalizeText(form.get("medicalNotes")),
    };

    if (data.fullName.length < 2) {
      setMessage({ type: "error", text: "Please enter the patient name." });
      return;
    }

    if (data.phone.length !== 10) {
      setMessage({ type: "error", text: "Please enter a valid 10-digit mobile number." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        mode === "create" ? "/api/patients" : `/api/patients/${patient?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const body = (await response.json().catch(() => ({}))) as PatientResponse;

      if (!response.ok) {
        throw new Error(firstIssue(body) || body.error || "Patient could not be saved.");
      }

      const patientId = mode === "create" ? body.id : patient?.id;
      if (!patientId) throw new Error("Patient saved, but profile could not be opened.");

      const successText = body.existed
        ? "This phone number already exists. Opening the saved patient profile."
        : mode === "create"
          ? "Patient profile saved successfully."
          : "Patient profile updated successfully.";

      setMessage({ type: "success", text: successText });
      toast.success(successText);
      router.push(`/dashboard/patients/${patientId}`);
      router.refresh();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Patient could not be saved.";
      setMessage({ type: "error", text: errorText });
      toast.error(errorText);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-gradient-to-r from-sky-50 to-white px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700">
            <UserRoundPlus className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Patient details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Name and mobile number are required. Other details can be added later.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {message ? (
          <div
            className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
              message.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-800">
            Full name <span className="text-red-500">*</span>
            <Input
              required
              name="fullName"
              autoComplete="name"
              defaultValue={patient?.fullName}
              placeholder="Patient name"
              className="h-11 rounded-xl bg-white"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-800">
            Phone number <span className="text-red-500">*</span>
            <Input
              required
              name="phone"
              inputMode="numeric"
              autoComplete="tel"
              defaultValue={patient?.phone}
              placeholder="10-digit mobile number"
              className="h-11 rounded-xl bg-white"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-800">
            Email
            <Input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={patient?.email ?? ""}
              placeholder="name@example.com"
              className="h-11 rounded-xl bg-white"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-800">
            Date of birth
            <Input
              name="dateOfBirth"
              type="date"
              defaultValue={patient?.dateOfBirth?.slice(0, 10) ?? ""}
              className="h-11 rounded-xl bg-white"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-800">
            Gender
            <select
              name="gender"
              defaultValue={patient?.gender ?? ""}
              className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="">Not specified</option>
              <option>Female</option>
              <option>Male</option>
              <option>Non-binary</option>
              <option>Prefer not to say</option>
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-800">
            Address
            <Input
              name="address"
              defaultValue={patient?.address ?? ""}
              placeholder="Address"
              className="h-11 rounded-xl bg-white"
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-semibold text-slate-800">
          Medical notes
          <Textarea
            name="medicalNotes"
            rows={5}
            defaultValue={patient?.medicalNotes ?? ""}
            placeholder="Allergies, conditions, ongoing medicines, or other notes..."
            className="rounded-xl bg-white"
          />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl px-5"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="h-11 rounded-xl px-6">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving patient...
            </>
          ) : (
            title
          )}
        </Button>
      </div>
    </form>
  );
}
