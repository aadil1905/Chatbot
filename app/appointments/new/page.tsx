"use client";

import { useState } from "react";

export default function NewAppointmentPage() {
  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    appointmentDate: "",
    appointmentTime: "",
    treatment: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Appointment saved!");
      window.location.href = "/appointments";
    } else {
      alert("Failed to save appointment.");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">New Appointment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Patient Name"
          value={form.patientName}
          onChange={(e) =>
            setForm({ ...form, patientName: e.target.value })
          }
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <input
          type="date"
          className="w-full border p-2 rounded"
          value={form.appointmentDate}
          onChange={(e) =>
            setForm({ ...form, appointmentDate: e.target.value })
          }
        />

        <input
          type="time"
          className="w-full border p-2 rounded"
          value={form.appointmentTime}
          onChange={(e) =>
            setForm({ ...form, appointmentTime: e.target.value })
          }
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Treatment"
          value={form.treatment}
          onChange={(e) =>
            setForm({ ...form, treatment: e.target.value })
          }
        />

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded"
          type="submit"
        >
          Save Appointment
        </button>
      </form>
    </div>
  );
}