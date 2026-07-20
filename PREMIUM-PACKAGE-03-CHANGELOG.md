# DentalAI Premium v1.0 — Package 03

## Lead CRM and conversion pipeline

### Added

- New **Lead CRM** workspace in the Premium sidebar.
- Manual enquiry capture for reception staff.
- Lead-source tracking: WhatsApp, Website, Google, Referral, Walk-in or Manual.
- Pipeline stages: `NEW`, `CONTACTED`, `BOOKED`, `VISITED`, `CONVERTED`, and `LOST`.
- One lead profile per clinic phone number, which prevents accidental duplicate enquiries.
- Follow-up date, interest/service, notes and loss-reason fields.
- Basic lead activity history for CRM changes.
- Conversion-health cards for new enquiries, booked leads, converted leads, lost leads and conversion percentage.

### Important scope

This package provides the staff CRM foundation. Package 5 will connect persistent WhatsApp conversations to this CRM automatically. Package 6 will automate follow-ups and re-engagement after clinic approval.

### Installation

1. Extract this package into the existing DentalAI Premium project and replace files when Windows asks.
2. Stop the development server if it is running.
3. Run `npx prisma generate`.
4. Run `npx prisma migrate deploy`.
5. Run `npm run dev`, sign in, and open **Lead CRM** from the sidebar.

No `.env`, API key, WhatsApp token or patient data is included in the ZIP.
