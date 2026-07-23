# DentalAI Premium v1.0 — Package 08

## Team access and owner activity history

- Adds a secure clinic-level audit history for important settings actions.
- Records clinic profile changes, staff member creation, and staff access being enabled or disabled.
- Shows the 20 most recent actions in **Clinic settings → Recent owner activity**.
- Keeps audit entries isolated to the correct clinic.

## Database change

Adds the `AuditLog` table. Run the Prisma migration during installation.

## Preserved

Existing WhatsApp integration, appointments, patients, billing, lead CRM, AI Coach, reports, and clinic configuration remain unchanged.
