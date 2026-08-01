import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const CLIENT_ONLY_PATHS = new Set([
  ".env",
  ".env.local",
  "lib/brand.ts",
  "scripts/seed-deepika-services.mjs",
]);

const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

const base = getArg("base");
const target = getArg("target") ?? "HEAD";

if (!base) {
  console.error("Usage: npm run export:update -- --base <branch> [--target <branch>]");
  process.exit(1);
}

const runGit = (gitArgs) =>
  execFileSync("git", gitArgs, { encoding: "utf8" }).trim();

const getObjectType = (revisionPath) => {
  try {
    return runGit(["cat-file", "-t", revisionPath]);
  } catch {
    return undefined;
  }
};

const slug = (value) => value.replace(/[^a-zA-Z0-9._-]+/g, "-");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputDir = join(
  "update-packages",
  `${slug(base)}-to-${slug(target)}-${timestamp}`,
);

const diffEntries = runGit(["diff", "--name-status", `${target}...${base}`])
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const [status, filePath] = line.split(/\s+/, 2);
    return { status, filePath };
  })
  .filter(({ filePath }) => !CLIENT_ONLY_PATHS.has(filePath))
  .filter(({ filePath }) => !filePath.startsWith("update-packages/"))
  .filter(({ status, filePath }) => {
    return status === "D" || getObjectType(`${base}:${filePath}`) !== "commit";
  });

if (diffEntries.length === 0) {
  console.log(`No reusable changes found from ${base} to ${target}.`);
  process.exit(0);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const { status, filePath } of diffEntries) {
  if (status === "D") {
    continue;
  }

  const destination = join(outputDir, "files", filePath);
  mkdirSync(dirname(destination), { recursive: true });
  const content = execFileSync("git", ["show", `${base}:${filePath}`]);
  writeFileSync(destination, content);
}

writeFileSync(
  join(outputDir, "README.md"),
  [
    `# Update Package: ${base} to ${target}`,
    "",
    "Copy the contents of `files/` into the client branch root, then review and commit.",
    "",
    "Excluded client-only files:",
    "",
    ...Array.from(CLIENT_ONLY_PATHS).map((path) => `- \`${path}\``),
    "",
    "Included files:",
    "",
    ...diffEntries.map(({ status, filePath }) => `- ${status} \`${filePath}\``),
    "",
  ].join("\n"),
);

console.log(`Exported ${diffEntries.length} change(s) to ${outputDir}`);
