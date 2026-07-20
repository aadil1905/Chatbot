# DentalAI Premium — Production Deployment & Clinic Handover

## One clinic, one deployment

Create a separate Supabase project, Vercel project, Meta WhatsApp configuration, and Git branch for each clinic. This prevents patient data and credentials from being mixed across clinics.

## Vercel environment variables

Copy the variable names from `.env.example` into the clinic's Vercel project. Set the real values only in Vercel; do not commit `.env` or `.env.local`.

- `DATABASE_URL` and `DIRECT_URL` — clinic Supabase database
- `OPENAI_API_KEY` — clinic-specific OpenAI Project key, billed through the agency account if desired
- `PHONE_NUMBER_ID`, `WHATSAPP_TOKEN`, `VERIFY_TOKEN` — clinic Meta WhatsApp configuration
- `AUTH_SECRET` — long random server secret
- `CRON_SECRET` — long random server secret for protected scheduled jobs

## WhatsApp launch

1. Add the clinic's WhatsApp Business number in the clinic-owned Meta Business Portfolio.
2. Set the webhook callback to `https://YOUR-DOMAIN/api/webhook`.
3. Use the same private `VERIFY_TOKEN` in Meta and Vercel.
4. Subscribe to incoming WhatsApp messages.
5. Test language selection, services, booking, Conversations, and Lead CRM.
6. Create and get Meta approval for outbound templates before scheduled re-engagement messages are enabled.

## Handover

- Give the clinic owner their own dashboard login.
- Add at least one backup owner/admin contact.
- Configure clinic services, hours, language copy, FAQs, and staff accounts.
- Test `https://YOUR-DOMAIN/api/health`; it should return `{ "status": "ok" }`.
- Review the Production Launch Centre at `/dashboard/launch` before handover.

## Security

Never send an OpenAI key, Meta token, Supabase connection URL, or Vercel secret to clinic staff over WhatsApp or email. Keep them in the relevant Vercel project only.
