# DentalAI Premium v1.0 — Build Fix: Appointment Booking

Restores the `saveAppointment` export required by `lib/booking.ts`.

This fixes the build error:

`"./appointment" has no exported member named "saveAppointment"`

It also restores patient `connectOrCreate`, so a WhatsApp booking is linked to an existing patient or creates a patient record safely.
