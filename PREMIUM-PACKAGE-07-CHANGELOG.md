# DentalAI Premium v1.0 — Package 07

## Conversion & Revenue Intelligence

### Added

- Conversion Intelligence reports based on the Lead CRM pipeline.
- Enquiry-to-appointment and appointment-to-treatment conversion rates.
- Lead-source performance and staff-recorded loss reasons.
- Recovered-lost-lead count.
- AI-attributed conversion value for WhatsApp leads, only when a team member marks the lead Converted and enters the value.
- Conversion value field in Lead CRM.

### Data integrity

- Metrics use recorded CRM data and never invent revenue or conversions.
- Billing totals continue to show actual invoice and payment data separately from AI-attributed conversion value.

### Database migration

Apply `20260720215000_add_conversion_intelligence` with:

```bash
npx prisma migrate deploy
```
