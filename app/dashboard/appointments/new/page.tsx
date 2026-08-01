import AppointmentForm from "../../../../components/appointments/AppointmentForm";
import PageIntro from "@/components/dashboard/PageIntro";

export default function NewAppointmentPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro
        eyebrow="Appointments"
        title="New Appointment"
        description="Schedule a clinic visit and start patient intake when needed."
      />

      <AppointmentForm />
    </div>
  );
}
