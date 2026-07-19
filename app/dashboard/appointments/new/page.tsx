import AppointmentForm from "../../../../components/appointments/AppointmentForm";

export default function NewAppointmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          New Appointment
        </h1>

        <p className="mt-2 text-muted-foreground">
          Create a new patient appointment.
        </p>
      </div>

      <AppointmentForm />
    </div>
  );
}