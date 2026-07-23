# DentalAI Premium v1.0 — Package 05

## Clinic Operations & WhatsApp Booking Configuration

### Added

- Owner-only **Clinic Operations** settings page at `/dashboard/settings/operations`.
- Clinic service catalogue: name, short description, duration, optional price, ordering, and active/inactive visibility.
- Only active services are presented in the WhatsApp booking flow, including configured prices when supplied.
- Per-day working hours: opening time, closing time, booking slot duration, and closed-day control.
- WhatsApp booking slots now respect the saved service duration and clinic working hours.
- Editable WhatsApp content for English, Hindi, and Marathi: welcome, booking introduction, and contact message.
- Sidebar/settings navigation to the operations area for the clinic owner.

### Behaviour preserved

- Existing WhatsApp webhook, AI chatbot, appointment booking, patients, and dashboard architecture remain intact.
- The WhatsApp language chooser provides **English, Hindi, and Marathi only**. Hinglish is not presented to patients.
- A legacy database field may still exist from an earlier version, but it is not used by the interface or chatbot.

### Database

This package includes the `20260720170000_add_clinic_configuration` Prisma migration. Run `npx prisma migrate deploy` after copying the files. Prisma skips it safely if it has already been applied.

### Verify after installation

1. Sign in as the clinic owner and open **Clinic settings → Manage clinic operations**.
2. Add a service and a price, then set working hours and save.
3. Send `Hi` to the configured WhatsApp number and select English, Hindi, or Marathi.
4. Choose **Book appointment** and confirm the visible services and offered slots match the clinic settings.
