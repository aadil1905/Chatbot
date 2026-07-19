# DentalAI Standard v1.0 — Package 4

## Billing and payment tracking

- Added invoices connected to patients and optional treatment plans.
- Added payment records with cash, UPI, card, bank-transfer, and other methods.
- Added automatic invoice status updates: Unpaid, Partially Paid, and Paid.
- Added billing overview, invoice creation, invoice details, payment-history, and loading states.
- Added a Billing item to the dashboard sidebar.

## Database migration

Run the included Prisma migration `20260720020000_add_billing` after installing this package.

## Security

No `.env`, `.env.local`, database credentials, or API keys are included in this package.
