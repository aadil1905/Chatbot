# DentalAI Premium v1.0 - Package 06

## Follow-ups and patient re-engagement

### Added

- Follow-up Centre for unbooked enquiries, missed appointments, and inactive patients.
- A safe refresh action that creates only one active follow-up task per patient or lead.
- Staff-controlled WhatsApp sending, with sent, pending, completed, and failed status tracking.
- A protected cron endpoint for a future Vercel schedule. It requires `CRON_SECRET` before it can be used.
- English, Hindi, and Marathi language options only. Hinglish has been removed.

### Safety

- Nothing sends automatically from this package. A staff member must choose **Send WhatsApp**.
- Template approval may still be required by WhatsApp for messages sent outside its 24-hour customer-service window.

### Included files

- Follow-up dashboard page and server actions.
- Follow-up generator library and database migration.
- Updated Prisma schema and navigation.

