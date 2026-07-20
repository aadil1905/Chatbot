# DentalAI Premium — Package 01: Secure Clinic Access

## Added

- One-time clinic owner setup at `/setup`.
- Secure staff sign-in at `/login`.
- Password hashing, signed HTTP-only sessions, and seven-day session expiry.
- Owner, dentist, and receptionist roles.
- Owner-only clinic settings page at `/dashboard/settings`.
- Owner can update clinic profile, create dentist/receptionist accounts, and disable staff access.
- Dashboard and private API routes require a signed session; the WhatsApp webhook and public chat route remain available.
- Dynamic clinic and logged-in staff name in the dashboard header.
- `.env.example` containing only variable names, including the new `AUTH_SECRET`.
- Prisma migration for `Clinic`, `User`, and `Session`.

## Before installation

1. Back up and commit the current project.
2. Add a unique `AUTH_SECRET` (at least 32 random characters) to `.env.local` and Vercel Production Environment Variables.
3. Apply the Prisma migration to the clinic database.
4. Open `/setup` once to create the clinic owner login.
5. After setup, use `/dashboard/settings` to add dentist and receptionist logins.

## Security notes

- Never commit `.env` or `.env.local`.
- Do not reuse an `AUTH_SECRET` between clinics.
- The clinic owner should choose their own password and keep it private.
- The WhatsApp webhook is intentionally public so Meta can deliver messages.

## Verification

- `npx prisma generate` passed.
- `npx tsc --noEmit` passed.
- `npm run build` passed.
