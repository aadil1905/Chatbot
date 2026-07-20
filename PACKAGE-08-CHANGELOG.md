# DentalAI Standard v1.0 — Package 8

## Data exports

- Added an **Exports** section in the dashboard sidebar.
- Added one-click CSV downloads for appointments, patients, and billing.
- Billing exports include invoice totals, payments, and outstanding amounts.
- CSV files are compatible with Excel and Google Sheets.
- Files are generated from current database data on demand.

## Security

- No migration or new environment variable is required.
- `.env`, `.env.local`, `.git`, `node_modules`, and `.next` are excluded from the delivery ZIP.
