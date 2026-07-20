# DentalAI Standard v1.0 — Package 7

## Follow-up centre

- Added a dedicated **Follow-ups** page in the dashboard sidebar.
- Added an upcoming-reminder queue for appointments in the next seven days.
- Added an overdue appointment follow-up queue.
- Added a recently-reminded queue, so staff can see what has already been sent.
- Staff can send WhatsApp reminders directly from the follow-up centre.
- Uses the existing WhatsApp integration and existing `reminderSentAt` appointment field; no migration is required.

## Security

- `.env`, `.env.local`, `.git`, `node_modules`, and `.next` are excluded from the delivery ZIP.
