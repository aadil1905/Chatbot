# DentalAI Premium v1.0 — Package 09

## Billing, Inventory & Lab Workflow

### Added

- Inventory items with quantity, unit, reorder level, and cost-per-unit.
- Low-stock alerts and controlled stock adjustments.
- Lab case workflow linked to a patient and optionally to a treatment plan.
- Lab case statuses: sent to lab, in progress, ready, delivered, and cancelled.
- Operations dashboard with inventory and lab summary metrics.

### Database migration

Apply `20260720219000_add_inventory_and_lab_cases` with:

```bash
npx prisma migrate deploy
```

### Scope

Billing remains the source of truth for invoices and payments. Inventory and lab data is operational tracking and does not auto-create financial entries.
