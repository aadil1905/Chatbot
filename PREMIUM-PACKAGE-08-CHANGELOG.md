# DentalAI Premium v1.0 — Package 08

## Clinical Workspace

### Added

- A protected Clinical Workspace for dentists and authorised staff.
- Patient dental chart with all 32 FDI tooth positions.
- Tooth-level conditions: healthy, caries, filling, crown, root canal, missing, implant, and watch.
- Tooth-specific clinical notes.
- Recent clinical-record history beside the dental chart.

### Database migration

Apply `20260720217000_add_dental_chart` with:

```bash
npx prisma migrate deploy
```

### Scope

This package stores clinical chart data in the existing clinic database. It does not diagnose patients or replace the dentist’s clinical judgement.
