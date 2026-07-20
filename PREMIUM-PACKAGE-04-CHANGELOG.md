# DentalAI Premium v1.0 — Package 04

## AI Conversion Coach

### Added

- New owner-only **AI Coach** workspace.
- Approved-answer library for pricing, EMI/payment, treatment, general and objection-handling questions.
- Answers can be enabled or disabled immediately without changing code.
- WhatsApp AI prompt now uses the clinic’s saved services, prices and active approved answers.
- Clear safety boundaries: the AI does not diagnose, prescribe, guarantee outcomes or invent clinic information.
- Booking-focused responses that direct patients to the existing appointment flow.

### Important scope

The coach is not an autonomous clinician. It gives staff-approved information and recommends booking or a staff follow-up whenever the saved clinic information does not answer a question.

### Installation

1. Extract this package into the existing DentalAI Premium project and replace files when Windows asks.
2. Stop the development server if it is running.
3. Run `npx prisma generate`.
4. Run `npx prisma migrate deploy`.
5. Run `npm run dev`, sign in as the owner, then open **AI Coach** in the sidebar.

No `.env`, API key, WhatsApp token, conversations or patient data is included.
