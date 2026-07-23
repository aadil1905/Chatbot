# DentalAI Premium v1.0 — Package 04

## Patient Care & Prescriptions

### Included

- A patient profile that brings together clinical records, prescriptions, treatment plans, invoices, and appointment history.
- A new prescription page, available from the sidebar and directly from an individual patient profile.
- A prescription form with patient selection, prescription date, diagnosis, medicine directions, and patient instructions.
- A validated `POST /api/prescriptions` API route that saves prescriptions into the selected patient's permanent history.
- Database migration for prescriptions plus treatment-plan service, tooth, and price fields.
- Navigation and validation updates required by the new workflow.

### Install order

1. Copy the files from this package into the project root, replacing files when Windows asks.
2. Run `npx prisma generate`.
3. Run `npx prisma migrate deploy`.
4. Run `npm run build` before committing and pushing.

### Notes

- This package is for the `premium-base` branch only.
- It preserves your WhatsApp integration and private `.env` / `.env.local` files.
