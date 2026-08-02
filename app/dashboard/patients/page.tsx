export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import PatientTableActions from "@/components/patients/PatientTableActions";
import { requirePermission } from "@/lib/permissions";

const PAGE_SIZE = 10;

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const user = await requirePermission("managePatients");
  const { search = "", page: rawPage = "1" } = await searchParams;
  const page = Math.max(1, Number(rawPage) || 1);
  const query = search.trim();
  const where = query
    ? {
        clinicId: user.clinicId,
        OR: [
          { fullName: { contains: query, mode: "insensitive" as const } },
          { phone: { contains: query } },
          { email: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : { clinicId: user.clinicId };

  const [total, patients] = await prisma.$transaction([
    prisma.patient.count({ where }),
    prisma.patient.findMany({
      where,
      include: { _count: { select: { appointments: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function href(next: number) {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (next > 1) params.set("page", String(next));
    return `/dashboard/patients?${params}`;
  }

  return (
    <div className="dashboard-list-page mx-auto max-w-7xl space-y-6">
      <header className="dashboard-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Patient workspace</p>
          <h1 className="mt-2 text-3xl font-bold">Patients</h1>
          <p className="mt-1 text-muted-foreground">
            One place for care, communications, treatment plans, and revenue history.
          </p>
        </div>
        <Link href="/dashboard/patients/new" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90">
          <Plus className="size-4" /> Add patient
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-sm font-medium text-muted-foreground">Patient records</p><p className="mt-1 text-2xl font-bold">{total}</p></div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-sm font-medium text-muted-foreground">Current view</p><p className="mt-1 text-2xl font-bold">{patients.length}</p></div>
        <div className="rounded-2xl border bg-primary/[0.04] p-4 shadow-sm"><p className="flex items-center gap-2 text-sm font-medium text-primary"><Users className="size-4" /> Patient 360</p><p className="mt-1 text-sm text-muted-foreground">Open a record to act without changing modules.</p></div>
      </section>

      <form className="flex max-w-xl gap-2">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <input
            name="search"
            defaultValue={query}
            placeholder="Search name, phone, or email..."
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
          />
        </label>
        <button className="rounded-md border px-4 text-sm font-medium transition hover:bg-muted">
          Search
        </button>
      </form>

      <Card>
        <CardContent className="p-0">
          {patients.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-semibold">No patients found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Only completed appointments are saved here automatically.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                    <tr>
                      <th className="p-4 font-medium">Patient</th>
                      <th className="p-4 font-medium">Contact</th>
                      <th className="p-4 font-medium">Completed visits</th>
                      <th className="p-4 font-medium">Added</th>
                      <th className="p-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium">{patient.fullName}</td>
                        <td className="p-4">
                          <div>{patient.phone}</div>
                          {patient.email && (
                            <div className="text-muted-foreground">{patient.email}</div>
                          )}
                        </td>
                        <td className="p-4">{patient._count.appointments}</td>
                        <td className="p-4 text-muted-foreground">
                          {patient.createdAt.toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <PatientTableActions patientId={patient.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t px-4 py-4 text-sm">
                <span className="text-muted-foreground">
                  {total} {total === 1 ? "patient" : "patients"} · Page{" "}
                  {Math.min(page, pages)} of {pages}
                </span>
                <div className="flex gap-2">
                  <Link
                    aria-disabled={page <= 1}
                    className="rounded-md border px-3 py-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                    href={href(page - 1)}
                  >
                    Previous
                  </Link>
                  <Link
                    aria-disabled={page >= pages}
                    className="rounded-md border px-3 py-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                    href={href(page + 1)}
                  >
                    Next
                  </Link>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
