import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const packageLock = JSON.parse(
  await readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
);

const lockedRoot = packageLock.packages?.[""];

if (!lockedRoot) {
  console.error("La section racine packages[\"\"] est absente du package-lock.json.");
  process.exit(1);
}

const sections = ["dependencies", "devDependencies"];
const differences = [];

for (const section of sections) {
  const declared = packageJson[section] ?? {};
  const locked = lockedRoot[section] ?? {};
  const names = new Set([...Object.keys(declared), ...Object.keys(locked)]);

  for (const name of [...names].sort()) {
    if (declared[name] !== locked[name]) {
      differences.push(
        `${section}.${name}: package.json=${declared[name] ?? "absent"}, package-lock.json=${locked[name] ?? "absent"}`,
      );
    }
  }
}

if (differences.length > 0) {
  console.error("Le manifeste npm et le verrou ne sont pas synchronisés :");
  for (const difference of differences) {
    console.error(`- ${difference}`);
  }
  process.exit(1);
}

console.log("package.json et package-lock.json sont synchronisés.");
