import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PatientForm from "@/components/patients/PatientForm";
export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const patient = await prisma.patient.findUnique({ where: { id: Number(id) } }); if (!patient) notFound(); return <div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-3xl font-bold">Edit patient</h1><p className="mt-1 text-muted-foreground">Update {patient.fullName}&apos;s profile.</p></div><PatientForm mode="edit" patient={{ ...patient, dateOfBirth: patient.dateOfBirth?.toISOString() ?? null }} /></div>; }
