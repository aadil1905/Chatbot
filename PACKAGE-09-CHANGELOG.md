# DentalAI Standard v1.0 — Package 9

## Interface refinement

- Rebuilt the Exports screen with a compact, aligned three-card desktop layout.
- Added reliable responsive layout rules: three columns on wide screens, two on medium screens, and one on phones.
- Improved the export header, spacing, card height, button alignment, and keyboard focus visibility.
- Kept all Package 8 CSV download functions unchanged.

## Security

- No migration or environment-variable change is required.
- `.env`, `.env.local`, `.git`, `node_modules`, and `.next` are excluded from the delivery ZIP.
