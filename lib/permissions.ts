import "server-only";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export const CLINIC_ROLES = ["OWNER", "DENTIST", "RECEPTIONIST"] as const;
export type ClinicRole = (typeof CLINIC_ROLES)[number];

export const PERMISSIONS = {
  manageClinic: ["OWNER"],
  manageStaff: ["OWNER"],
  manageBilling: ["OWNER", "RECEPTIONIST"],
  manageClinical: ["OWNER", "DENTIST"],
  manageSchedule: ["OWNER", "DENTIST", "RECEPTIONIST"],
  managePatients: ["OWNER", "DENTIST", "RECEPTIONIST"],
  exportData: ["OWNER"],
} as const satisfies Record<string, readonly ClinicRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!(PERMISSIONS[permission] as readonly ClinicRole[]).includes(user.role as ClinicRole)) {
    redirect("/dashboard");
  }
  return user;
}

export function can(role: string, permission: Permission) {
  return (PERMISSIONS[permission] as readonly ClinicRole[]).includes(role as ClinicRole);
}
