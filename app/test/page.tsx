"use client";

export default function TestPage() {
  async function saveAppointment() {
    const res = await fetch("/api/appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "John Doe",
        phone: "9876543210",
        date: "20 July",
        time: "10:00 AM",
        problem: "Tooth Pain",
      }),
    });

    const data = await res.json();

    alert(JSON.stringify(data));
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Appointment Test</h1>

      <button onClick={saveAppointment}>
        Save Appointment
      </button>
    </div>
  );
}