# DentalAI Standard v1.0 — Package 02

## Delivered: Patient Management

- Added the Patient data model with name, unique phone number, email, date of birth, gender, address, medical notes, and timestamps.
- Added the Patients dashboard module with search, pagination, patient counts, and responsive empty states.
- Added create, view, edit, and delete patient workflows.
- Added patient profiles with contact details, medical notes, and complete linked appointment history.
- Linked appointments to patients while preserving the existing appointment fields and WhatsApp booking flow.
- New appointments created through the dashboard, WhatsApp chatbot, or the existing appointment endpoint automatically create or link a patient by phone number.
- Added a database migration that backfills existing appointments into patient records and then links them by phone number.
- Fixed the sidebar Patients link to use `/dashboard/patients`.
- Removed the external Google Fonts build dependency so builds work without a Google Fonts network connection.

## Required database step before deployment

After copying this package into your project and before `git push`, run this once in your terminal:

```bash
npx prisma migrate deploy
```

This applies the included Patient database migration using your existing `DATABASE_URL`. Do not skip it: the Patient pages require the new database table.

## Verification

- Prisma client generation passed.
- TypeScript validation passed.
- ESLint completed with no errors; the two existing warnings in webhook/form code remain.
- `next build` completed successfully.

## Secrets

No `.env` or `.env.local` files are included. Continue using the existing Vercel and local environment variables.
