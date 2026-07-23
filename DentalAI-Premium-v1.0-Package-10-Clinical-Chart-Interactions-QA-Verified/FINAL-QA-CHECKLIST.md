# Premium v1.0 final QA checklist

Run this after installing Package 10.

## Build and navigation

- [ ] `npm run build` finishes successfully.
- [ ] `npm run dev` opens the dashboard without an error overlay.
- [ ] Dashboard → Dental chart opens and all three tabs can be clicked.

## Dental chart

- [ ] Every FDI tooth number is centered within its tile.
- [ ] Select a dashboard tooth; its selected label updates.
- [ ] Open **Scan**, select **Run chart review**, and verify the summary cards appear.
- [ ] Open **Insights** and verify the workspace link works.
- [ ] Open Clinical workspace for a patient; select a tooth and confirm the right-side form changes to that tooth.
- [ ] Save a chart condition and note, then refresh to confirm the entry remains.

## Safety and release checks

- [ ] The team reviews patient information before using any scan/insight output for clinical decisions.
- [ ] No `.env` or `.env.local` was copied from this package.
- [ ] Review the browser and terminal for errors before deploying to Vercel.
