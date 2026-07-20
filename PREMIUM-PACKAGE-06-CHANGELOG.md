# DentalAI Premium v1.0 — Package 06

## Automated Follow-ups & Patient Re-engagement

### Added

- A database-backed Follow-up Centre for new enquiries, missed appointments, and inactive patients.
- **Refresh follow-up queue** to find eligible patients without duplicating current tasks.
- Staff-controlled **Send WhatsApp** and **Mark complete** actions.
- Status tracking for pending, sent, failed, and completed follow-ups.
- A protected scheduled-job endpoint at `/api/cron/follow-ups` for a later production schedule.

### Safety

- Messages are not silently auto-sent. A staff member must press **Send WhatsApp**.
- This protects the clinic from sending free-form WhatsApp messages outside Meta's 24-hour customer-service window.
- When production templates are approved in Meta, Package 10 can connect the scheduled job to those templates.

### Database migration

Apply `20260720213000_add_follow_up_tasks` with:

```bash
npx prisma migrate deploy
```

### Future production configuration

- Set a private `CRON_SECRET` only in Vercel, never in GitHub.
- Configure Vercel Cron later to call the protected endpoint daily.
