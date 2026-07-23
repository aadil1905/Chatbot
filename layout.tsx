import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { requireUser } from "@/lib/auth";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={user.role} />

      <main className="flex-1">
        <div className="relative"><Navbar user={{ fullName: user.fullName, role: user.role, clinicName: user.clinic.name }} /><div className="absolute right-6 top-1/2 -translate-y-1/2 lg:right-10"><LogoutButton /></div></div>

        <div className="mx-auto w-full max-w-[1600px] p-5 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
