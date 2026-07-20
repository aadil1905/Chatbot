# DentalAI Standard v1.0 — Package 5

## Scheduling and WhatsApp reminders

- Added a weekly clinic calendar at Dashboard → Calendar.
- Added week navigation and per-day appointment schedule cards.
- Added reminder status on calendar appointments.
- Added a safe manual **Send WhatsApp reminder** action to each appointment.
- Reminders use the project’s existing WhatsApp integration and record the sent time only after the WhatsApp request succeeds.

## Database migration

Run the included migration `20260720030000_add_appointment_reminders` after installing.

## Security

No environment files, API keys, tokens, or database credentials are included.
