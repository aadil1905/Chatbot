# DentalAI v1.0 Upgrade — Package 01: Smart Clinical Workflow

## Applies to

DentalAI Premium v1.0. This package is the Premium edition of the shared clinical workflow upgrade.

## Added

- Prescription creation with medicine, dose/frequency text, diagnosis, and patient instructions.
- Prescription history inside every patient profile.
- Quick **New prescription** action from a patient profile.
- Treatment plans can use a saved clinic service and its default price.
- Treatment plans can be linked to an FDI tooth number (for example, `16`).
- Patient-specific treatment price is saved with the plan and visible in patient history.
- Patient profile now presents clinical records, prescriptions, treatment plans, bills, and appointment history together.

## Important setup

1. Run `npx prisma generate`.
2. Run `npx prisma migrate deploy` against the clinic database.
3. Restart the app with `npm run dev` locally, or deploy through Vercel.

## Safety

- No API keys, WhatsApp tokens, or environment files are included.
- Existing patient, appointment, treatment-plan, and invoice records are preserved.
- Tooth numbers and service links are optional, so old treatment plans continue to work.

## Build verification

- `npx tsc --noEmit` passed.
- `npm run build` passed.
