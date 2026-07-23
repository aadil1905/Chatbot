import { prisma } from "@/lib/prisma";

type FollowUpCandidate = {
  clinicId: number;
  leadId?: number;
  patientName: string;
  phone: string;
  taskType: "LEAD_NURTURE" | "MISSED_APPOINTMENT" | "REACTIVATION";
  message: string;
};

async function addTaskIfNeeded(candidate: FollowUpCandidate) {
  const existing = await prisma.followUpTask.findFirst({
    where: {
      clinicId: candidate.clinicId,
      leadId: candidate.leadId,
      phone: candidate.phone,
      taskType: candidate.taskType,
      status: { in: ["PENDING", "SENT"] },
    },
  });
  if (existing) return false;
  await prisma.followUpTask.create({ data: candidate });
  return true;
}

export async function generateFollowUpTasks(clinicId: number) {
  const now = new Date();
  const staleThreshold = new Date(now);
  staleThreshold.setDate(staleThreshold.getDate() - 2);
  const inactiveThreshold = new Date(now);
  inactiveThreshold.setDate(inactiveThreshold.getDate() - 180);

  const [leads, patients, overdueAppointments] = await Promise.all([
    prisma.lead.findMany({
      where: { clinicId, stage: { in: ["NEW", "CONTACTED"] }, updatedAt: { lte: staleThreshold } },
      take: 100,
    }),
    prisma.patient.findMany({
      include: { appointments: { orderBy: { appointmentDate: "desc" }, take: 1 } },
      take: 300,
    }),
    prisma.appointment.findMany({
      where: { status: { in: ["Pending", "Confirmed"] }, appointmentDate: { lt: now } },
      take: 100,
    }),
  ]);

  let created = 0;
  for (const lead of leads) {
    const didCreate = await addTaskIfNeeded({
      clinicId,
      leadId: lead.id,
      patientName: lead.fullName,
      phone: lead.phone,
      taskType: "LEAD_NURTURE",
      message: `Hello ${lead.fullName}, this is a friendly follow-up from our clinic. Would you like help booking your appointment?`,
    });
    if (didCreate) created += 1;
  }

  for (const appointment of overdueAppointments) {
    const didCreate = await addTaskIfNeeded({
      clinicId,
      patientName: appointment.patientName,
      phone: appointment.phone,
      taskType: "MISSED_APPOINTMENT",
      message: `Hello ${appointment.patientName}, we missed you at your scheduled appointment. Would you like us to help you choose a new time?`,
    });
    if (didCreate) created += 1;
  }

  for (const patient of patients) {
    const lastAppointment = patient.appointments[0];
    if (!lastAppointment || lastAppointment.appointmentDate > inactiveThreshold) continue;
    const didCreate = await addTaskIfNeeded({
      clinicId,
      patientName: patient.fullName,
      phone: patient.phone,
      taskType: "REACTIVATION",
      message: `Hello ${patient.fullName}, it has been some time since your last visit. Would you like to schedule a dental check-up?`,
    });
    if (didCreate) created += 1;
  }

  return created;
}
