"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PatientTableActions({ patientId }: { patientId: number }) {
  const router = useRouter();

  async function remove() {
    if (!window.confirm("Delete this patient profile? Appointment records will stay in appointments.")) return;

    const response = await fetch(`/api/patients/${patientId}`, { method: "DELETE" });

    if (!response.ok) {
      toast.error("Could not delete patient.");
      return;
    }

    toast.success("Patient deleted.");
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-2">
      <Link
        href={`/dashboard/patients/${patientId}`}
        className="inline-flex h-9 items-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md"
      >
        View
      </Link>
      <Link
        href={`/dashboard/patients/${patientId}/edit`}
        className="inline-flex h-9 items-center rounded-xl border border-primary/20 bg-primary/10 px-4 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground hover:shadow-md"
      >
        Edit
      </Link>
      <Button
        type="button"
        variant="destructive"
        className="h-9 rounded-xl px-4 font-semibold transition hover:-translate-y-0.5 hover:shadow-md"
        onClick={remove}
      >
        Delete
      </Button>
    </div>
  );
}
