import { randomBytes, scryptSync } from "crypto";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";

const email = "aadilsayyed7383@gmail.com";
const rl = createInterface({ input, output });
const password = await rl.question("Enter new dashboard password (10+ chars): ");
rl.close();

if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const escapedEmail = email.replaceAll("'", "''");
const escapedHash = hash.replaceAll("'", "''");

console.log("\nCopy this SQL into Supabase SQL Editor and run it:\n");
console.log(`UPDATE "User" SET "passwordHash" = '${escapedHash}', "active" = true WHERE "email" = '${escapedEmail}';`);
console.log("\nThen login with:");
console.log(`Email: ${email}`);
console.log("Password: the new password you just typed");
