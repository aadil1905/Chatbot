import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicIntakeForm from "@/components/patients/PublicIntakeForm";

export const dynamic = "force-dynamic";

export default async function PublicIntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const intake = await prisma.patientIntakeRequest.findUnique({
    where: { token },
    include: { patient: true, clinic: true },
  });
  if (!intake) notFound();

  const expired = intake.expiresAt <= new Date();
  const completed = ["COMPLETED", "REVIEWED"].includes(intake.status);
  if (!expired && !completed && !intake.openedAt) {
    await prisma.patientIntakeRequest.update({
      where: { id: intake.id },
      data: { status: "OPENED", openedAt: new Date() },
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">{intake.clinic.name}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Secure patient intake</h1>
          <p className="mt-2 text-slate-600">Medical history and treatment consent for {intake.patient.fullName}</p>
        </header>
        {expired ? (
          <div className="rounded-3xl border bg-white p-8 text-center shadow-sm"><h2 className="text-xl font-bold">This link has expired</h2><p className="mt-2 text-slate-600">Please contact the clinic for a new intake link.</p></div>
        ) : completed ? (
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm"><h2 className="text-xl font-bold text-emerald-800">Form already completed</h2><p className="mt-2 text-slate-600">The clinic has received your information. You can close this page.</p></div>
        ) : (
          <PublicIntakeForm token={token} patientName={intake.patient.fullName} />
        )}
      </div>
    </main>
  );
}
