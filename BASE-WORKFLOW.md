# Base Branch Workflow

This repo uses three separate product lanes so base updates and clinic-specific work stay clean.

## Branches

| Branch | Purpose | Edit Here When |
| --- | --- | --- |
| `standard-base` | Reusable standard dashboard/chatbot base | The feature should go to every standard clinic |
| `premium-base` | Reusable premium dashboard/chatbot base | The feature should go to every premium clinic |
| `client/deepika-dental-white` | Dr. Deepika's live clinic version | The change is only for this clinic |
| `main` | Vercel production deploy branch | You are ready to deploy the current client version |

## Client-Only Files

Keep clinic-specific details out of base branches unless you are intentionally changing the default template.

- `lib/brand.ts`
- `scripts/seed-deepika-services.mjs`
- `.env`
- `.env.local`
- Clinic-specific copy in pages, emails, WhatsApp messages, seed data, and images

## Base Update Flow

1. Switch to the base you want to improve.
   ```bash
   git switch premium-base
   ```

2. Make and commit the reusable update.
   ```bash
   git add .
   git commit -m "Add premium base update"
   ```

3. Export a copy/paste update package for a client branch.
   ```bash
   npm run export:update -- --base premium-base --target client/deepika-dental-white
   ```

4. Send the generated folder from `update-packages/`.

5. Apply the update to a client branch when ready.
   ```bash
   git switch client/deepika-dental-white
   git merge premium-base
   ```

6. Deploy by pushing the client branch to `main`.
   ```bash
   git push origin HEAD:main
   ```

## Standard To Premium Flow

If a standard-base feature should also exist in premium:

```bash
git switch premium-base
git merge standard-base
git push origin premium-base
```

Then export or merge from `premium-base` into client branches.

## Rule Of Thumb

- Base branches are products.
- Client branches are installations.
- `main` is what Vercel runs for the current live client.
