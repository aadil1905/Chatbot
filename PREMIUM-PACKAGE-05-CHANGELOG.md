# DentalAI Premium v1.0 — Package 05

## Persistent WhatsApp Conversations & Smart Booking

### Added

- Persistent WhatsApp conversations and messages stored in the clinic database.
- Incoming WhatsApp enquiries automatically create or update a Lead CRM record.
- Persistent language choice and booking progress, safe across Vercel deployments and server restarts.
- A booking confirmation automatically links the WhatsApp lead to its appointment and marks the lead as `BOOKED`.
- New **Conversations** dashboard page for saved WhatsApp enquiries, last message, language, and any unfinished booking step.

### Improved

- WhatsApp sends its language selector for new greetings while retaining the conversation audit trail.
- Both incoming patient messages and successful outgoing clinic replies are captured in the conversation history.
- The AI can use the recent conversation context rather than responding as if every message is the first message.

### Database migration

Apply `20260720210000_add_persistent_whatsapp` with:

```bash
npx prisma migrate deploy
```

### Privacy note

Conversation history contains patient communications. Only authorised clinic dashboard users should access this deployment. The package contains no `.env`, API key, WhatsApp token, or patient database export.
