import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const checks = [
  ["app/api/chat/route.ts", "requireApiUser"],
  ["app/api/clinical-records/route.ts", "clinicId: user.clinicId"],
  ["app/api/invoices/route.ts", "clinicId: user.clinicId"],
  ["app/api/invoices/[id]/send-whatsapp/route.ts", "patient: { clinicId: user.clinicId }"],
  ["app/api/missed-calls/route.ts", "MISSED_CALL_WEBHOOK_SECRET"],
  ["app/api/webhook/route.ts", "x-hub-signature-256"],
  ["proxy.ts", "const publicApi = [\"/api/webhook\", \"/api/health\", \"/api/cron/follow-ups\", \"/api/public-intake\"]"],
];

const failures = checks.flatMap(([file, expected]) => {
  const contents = readFileSync(resolve(root, file), "utf8");
  return contents.includes(expected) ? [] : [`${file} is missing the required security boundary: ${expected}`];
});

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Verified ${checks.length} security boundaries.`);
