"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const conditions = ["HEALTHY", "CARIES", "FILLING", "CROWN", "ROOT_CANAL", "MISSING", "IMPLANT", "WATCH"];
const conditionLabels: Record<string, string> = {
  HEALTHY: "Healthy",
  CARIES: "Caries",
  FILLING: "Filling",
  CROWN: "Crown",
  ROOT_CANAL: "Root canal",
  MISSING: "Missing",
  IMPLANT: "Implant",
  WATCH: "Watch",
};

function dateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function localDayRange(dayKey: string) {
  const start = new Date(`${dayKey}T00:00:00.000+05:30`);
  const end = new Date(`${dayKey}T23:59:59.999+05:30`);
  return { start, end };
}

export async function saveDentalChartEntryAction(formData: FormData) {
  await requireUser();
  const patientId = Number(formData.get("patientId"));
  const toothNumber = String(formData.get("toothNumber") || "");
  const condition = String(formData.get("condition") || "HEALTHY");
  const notes = String(formData.get("notes") || "").trim() || null;
  const visitDateInput = String(formData.get("visitDate") || "").trim();
  if (
    !Number.isInteger(patientId) ||
    !toothNumber ||
    !conditions.includes(condition) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(visitDateInput)
  ) {
    return;
  }

  const completedAppointments = await prisma.appointment.findMany({
    where: { patientId, status: "Completed" },
    select: { appointmentDate: true },
  });
  const appointmentForVisit = completedAppointments.find(
    (appointment) => dateKey(appointment.appointmentDate) === visitDateInput,
  );
  if (!appointmentForVisit) return;

  const { start: visitStart, end: visitEnd } = localDayRange(visitDateInput);
  const visitDate = appointmentForVisit.appointmentDate;

  const existingChartEntry = await prisma.dentalChartEntry.findFirst({
    where: {
      patientId,
      toothNumber,
      visitDate: { gte: visitStart, lte: visitEnd },
    },
  });

  if (existingChartEntry) {
    await prisma.dentalChartEntry.update({
      where: { id: existingChartEntry.id },
      data: { condition, notes, visitDate },
    });
  } else {
    await prisma.dentalChartEntry.create({
      data: { patientId, toothNumber, visitDate, condition, notes },
    });
  }
  const chiefComplaint = `Tooth ${toothNumber} - ${conditionLabels[condition]}`;
  const existingRecord = await prisma.clinicalRecord.findFirst({
    where: {
      patientId,
      chiefComplaint: { startsWith: `Tooth ${toothNumber} -` },
      visitDate: { gte: visitStart, lte: visitEnd },
    },
    orderBy: { updatedAt: "desc" },
  });
  const recordData = {
      patientId,
      visitDate,
      chiefComplaint,
      diagnosis: conditionLabels[condition],
      clinicalNotes: notes || `Updated tooth ${toothNumber} in clinical workspace.`,
  };
  if (existingRecord) {
    await prisma.clinicalRecord.update({
      where: { id: existingRecord.id },
      data: recordData,
    });
  } else {
    await prisma.clinicalRecord.create({ data: recordData });
  }
  revalidatePath(`/dashboard/clinical-workspace/${patientId}`);
  revalidatePath(`/dashboard/patients/${patientId}`);
}

export async function clearVisitDentalWorkspaceAction(formData: FormData) {
  await requireUser();
  const patientId = Number(formData.get("patientId"));
  const visitDateInput = String(formData.get("visitDate") || "").trim();

  if (!Number.isInteger(patientId) || !/^\d{4}-\d{2}-\d{2}$/.test(visitDateInput)) {
    return;
  }

  const completedAppointments = await prisma.appointment.findMany({
    where: { patientId, status: "Completed" },
    select: { appointmentDate: true },
  });
  const hasCompletedVisit = completedAppointments.some(
    (appointment) => dateKey(appointment.appointmentDate) === visitDateInput,
  );
  if (!hasCompletedVisit) return;

  const { start: visitStart, end: visitEnd } = localDayRange(visitDateInput);

  await prisma.dentalChartEntry.deleteMany({
    where: {
      patientId,
      visitDate: { gte: visitStart, lte: visitEnd },
    },
  });

  await prisma.clinicalRecord.deleteMany({
    where: {
      patientId,
      chiefComplaint: { startsWith: "Tooth " },
      visitDate: { gte: visitStart, lte: visitEnd },
    },
  });

  revalidatePath(`/dashboard/clinical-workspace/${patientId}`);
  revalidatePath(`/dashboard/patients/${patientId}`);
}
