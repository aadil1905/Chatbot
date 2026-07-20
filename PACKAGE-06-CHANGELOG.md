# DentalAI Standard v1.0 — Package 6

## Analytics and reports

- Added a new **Reports** section in the sidebar at `/dashboard/reports`.
- Added live patient, appointment, completion-rate, and collection metrics.
- Added appointment-status and treatment-demand visual reports.
- Added invoiced, collected, and outstanding billing totals.
- Reports use the existing database and require no new migration.

## UI cleanup

- Rebuilt the appointment-details page into a compact, aligned responsive layout.
- Standardized page spacing and content width across the dashboard workspace.
- Kept the filled Edit Appointment and Send WhatsApp Reminder actions, with clear status colours.
- Preserved the responsive calendar layout and WhatsApp reminder display.

## WhatsApp language-first entry

- A new contact sending Hi, Hello, Menu, or Start first receives a language selection.
- Included English, Hindi, Hinglish, and Marathi choices.
- Existing WhatsApp booking and AI architecture remain preserved.

## Security

- `.env`, `.env.local`, `.git`, `node_modules`, and `.next` are excluded from the delivery ZIP.
