export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface Appointment {
  id: number;
  patientName: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  treatment: string;
  status: AppointmentStatus;
  notes: string | null;
}