import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const stats = [
    { title: "Today's Appointments", value: 18 },
    { title: "Pending", value: 6 },
    { title: "Completed", value: 12 },
    { title: "New Patients", value: 4 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, Doctor 👋
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <p className="text-gray-500">{stat.title}</p>
              <h2 className="text-4xl font-bold mt-3">
                {stat.value}
              </h2>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}