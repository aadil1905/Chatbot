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

export const patientSchema = z.object({
  fullName: z.string().trim().min(2, "Patient name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
  email: z.union([z.literal(""), z.string().email("Enter a valid email")]).optional(),
  dateOfBirth: z.union([z.literal(""), z.string().date()]).optional(),
  gender: z.union([z.literal(""), z.enum(["Female", "Male", "Non-binary", "Prefer not to say"])]).optional(),
  address: z.string().max(500, "Address is too long").optional(),
  medicalNotes: z.string().max(2000, "Medical notes are too long").optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

export const clinicalRecordSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  visitDate: z.string().date(),
  chiefComplaint: z.string().trim().min(2, "Chief complaint is required").max(1000),
  diagnosis: z.string().max(1000).optional(),
  clinicalNotes: z.string().max(5000).optional(),
});

export const treatmentPlanSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  title: z.string().trim().min(2, "Plan title is required").max(200),
  status: z.enum(["Proposed", "Accepted", "In Progress", "Completed", "Cancelled"]),
  estimatedCost: z.union([z.literal(""), z.coerce.number().int().nonnegative()]).optional(),
  notes: z.string().max(5000).optional(),
});

export const invoiceSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  treatmentPlanId: z.union([z.literal(""), z.coerce.number().int().positive()]).optional(),
  issueDate: z.string().date(),
  dueDate: z.union([z.literal(""), z.string().date()]).optional(),
  totalAmount: z.coerce.number().int().positive("Invoice amount must be greater than zero"),
  notes: z.string().max(2000).optional(),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().int().positive("Payment amount must be greater than zero"),
  method: z.enum(["Cash", "UPI", "Card", "Bank transfer", "Other"]),
  paidAt: z.string().date(),
  notes: z.string().max(1000).optional(),
});
