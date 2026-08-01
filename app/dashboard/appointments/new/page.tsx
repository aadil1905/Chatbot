import AppointmentForm from "../../../../components/appointments/AppointmentForm";

export default function NewAppointmentPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">Appointments</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          New Appointment
        </h1>

        <p className="mt-2 text-muted-foreground">
          Schedule a clinic visit and start patient intake when needed.
        </p>
      </div>

      <AppointmentForm />
    </div>
  );
}
