# DentalAI Standard v1.0 — Package 03

## Delivered: Clinical Records and Treatment Plans

- Added clinical records linked to a patient, with visit date, chief complaint, diagnosis, and clinical notes.
- Added treatment plans linked to a patient, with title, status, estimated cost in INR, and notes.
- Added dashboard lists for recent clinical records and treatment plans.
- Added new-record and new-treatment-plan forms with patient selection.
- Added secure server APIs to create, update, and delete clinical records and treatment plans.
- Added sidebar links for Clinical Records and Treatment Plans.
- Added the Patient/ClinicalRecord/TreatmentPlan relational database migration.
- Marked database-backed creation pages as dynamic so production builds do not attempt to access the database while building.

## Required database step before deployment

After copying this package into your project, run once:

```bash
npx prisma generate
npx prisma migrate deploy
```

Package 2's migration history must already be applied (it is if you completed Package 2 installation).

## Verification

- Prisma client generation passed.
- TypeScript validation passed.
- ESLint completed with no errors; two existing non-blocking warnings remain.
- `next build` completed successfully.

## Secrets

No `.env` or `.env.local` files are included. Existing Vercel and local environment variables remain unchanged.
