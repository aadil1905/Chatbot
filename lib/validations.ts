import { z } from "zod";

export const appointmentSchema = z.object({
  patientName: z
    .string()
    .min(2, "Patient name must be at least 2 characters"),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits"),

  appointmentDate: z.string().min(1, "Appointment date is required"),

  appointmentTime: z.string().min(1, "Appointment time is required"),

  treatment: z
    .string()
    .min(2, "Treatment is required"),

  status: z.enum([
    "Pending",
    "Confirmed",
    "Completed",
    "Cancelled",
  ]),

  notes: z.string().optional(),
});

export type AppointmentFormValues = z.infer<
  typeof appointmentSchema
>;