"use client";

import { useState } from "react";
import { clinicBrand } from "@/lib/brand";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {
    if (!message) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setReply(data.reply || data.error);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[420px]">
        <h1 className="text-3xl font-bold mb-4">
          {clinicBrand.doctorName}
        </h1>
        <p className="mb-2 text-sm font-semibold text-slate-700">{clinicBrand.clinicName}</p>
        <p className="mb-4 text-sm leading-6 text-slate-600">{clinicBrand.address}</p>

        <textarea
          className="border rounded-lg w-full p-3 h-40"
          placeholder="Ask about appointments, services, or clinic timings..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 w-full"
        >
          Send
        </button>

        {reply && (
          <div className="mt-4 p-3 border rounded-lg">
            <strong>Reply:</strong>
            <p>{reply}</p>
          </div>
        )}
      </div>
    </main>
  );
}
