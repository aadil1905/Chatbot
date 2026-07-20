# DentalAI Premium v1.0 — Package 02

## Clinic operations configuration

This package makes the premium base ready to configure for each clinic without editing application code.

### Added

- Owner-only **Clinic operations** page at `/dashboard/settings/operations`.
- Configurable dental services with optional description, duration, price, display order and active/inactive control.
- Configurable working hours, closed days and appointment-slot duration for every day of the week.
- Clinic-specific WhatsApp welcome copy in English, Hindi, Hinglish and Marathi.
- Editable booking-introduction and contact messages.
- Database tables for services, clinic hours and WhatsApp wording.

### WhatsApp booking improvements

- Booking now lists the clinic's active dental services instead of fixed generic choices.
- Removed the unrelated hard-coded `Fever / Cold` option.
- Appointment times now follow the configured hours and slot duration for the selected day.
- The Services and Contact menu buttons now answer from the saved clinic configuration.
- First-time clinic setup receives sensible dental-service and working-hour defaults, which the owner can edit.

### Installation

1. Extract this package into the existing DentalAI Premium project and replace files when Windows asks.
2. Stop the development server if it is running.
3. Run `npx prisma generate`.
4. Run `npx prisma migrate deploy`.
5. Run `npm run dev`, sign in as the clinic owner, then open **Clinic settings → Manage clinic operations**.

No API key, WhatsApp token or `.env.local` value is included in this package.
