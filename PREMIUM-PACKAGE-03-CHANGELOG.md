# DentalAI Premium v1.0 — Package 03

## AI Conversion Coach & Lead Recovery

### Added and improved

- Lead CRM pipeline with enquiry source and interested-service tracking.
- Working stage and source filters for faster reception follow-up.
- Conversion health cards: new, booked, converted, lost and conversion rate.
- Lost lead recovery: staff can reopen a lost lead in one click; it is moved to Contacted and queued for follow-up.
- Follow-up centre remains included for unbooked enquiries, missed appointments and inactive-patient re-engagement.
- WhatsApp first-message language choices are now **English, Hindi and Marathi** only. Hinglish is removed from the booking flow and clinic settings.
- Appointment booking build repair included: `saveAppointment` is supplied in `lib/appointment.ts` to resolve the missing-export build error.

### Verification

- `npm run build` completed successfully before this ZIP was created.

### Installation

1. Extract into the root of the existing DentalAI Premium project.
2. Choose **Replace files in the destination** if Windows asks.
3. Run `npx prisma generate`, then `npm run build`.
4. Run `npm run dev` and open **Lead CRM** and **Follow-ups**.

No `.env`, API key, WhatsApp token or patient data is included.
