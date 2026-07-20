import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="mx-auto w-full max-w-[1600px] p-5 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
