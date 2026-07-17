import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-gray-500">
          Live appointments from Supabase
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Patient</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Treatment</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b">
                  <td className="p-3">{appointment.patientName}</td>
                  <td className="p-3">{appointment.phone}</td>
                  <td className="p-3">
                    {appointment.appointmentDate.toLocaleDateString()}
                  </td>
                  <td className="p-3">{appointment.appointmentTime}</td>
                  <td className="p-3">{appointment.treatment}</td>
                  <td className="p-3">{appointment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}