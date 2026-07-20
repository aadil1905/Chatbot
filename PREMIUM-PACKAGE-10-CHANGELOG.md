# DentalAI Premium v1.0 — Package 10

## Production Launch & Clinic Success System

### Added

- Owner-only Production Launch Centre.
- Safe environment readiness checks that never expose credentials.
- Persisted clinic handover checklist for Meta webhook, templates, staff, and support readiness.
- Public minimal health endpoint at `/api/health`; it returns no patient data.
- Production deployment and clinic handover guide.
- `CRON_SECRET` documented in `.env.example` for future protected scheduled follow-ups.

### Security improvement

- The protected follow-up cron route is now allowed through the request proxy so it can authenticate itself using `CRON_SECRET`; it still rejects every request without the correct secret.

### Database migration

Apply `20260720221000_add_launch_checklist` with:

```bash
npx prisma migrate deploy
```
