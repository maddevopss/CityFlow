import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(frontendRoot, "src");
const packageJson = JSON.parse(
  await readFile(path.join(frontendRoot, "package.json"), "utf8"),
);

const sourceExtensions = new Set([
  ".cjs",
  ".css",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
]);
const ignoredDependencies = new Set(["react", "react-dom"]);
const ignoredDirectories = new Set(["dist", "node_modules"]);

async function collectFiles(directory, recursive = true) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (recursive && !ignoredDirectories.has(entry.name)) {
        files.push(...(await collectFiles(entryPath)));
      }
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function packageNameFromSpecifier(specifier) {
  if (specifier.startsWith(".") || specifier.startsWith("/")) {
    return null;
  }

  if (specifier.startsWith("@")) {
    return specifier.split("/").slice(0, 2).join("/");
  }

  return specifier.split("/")[0];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scriptUsesDependency(scriptCommands, dependency) {
  const escapedDependency = escapeRegExp(dependency);
  const packageNameCharacter = "A-Za-z0-9@._-";
  const pattern = new RegExp(
    `(^|[^${packageNameCharacter}])${escapedDependency}($|[^${packageNameCharacter}])`,
  );

  return pattern.test(scriptCommands);
}

const auditedFiles = [
  ...(await collectFiles(sourceRoot)),
  ...(await collectFiles(frontendRoot, false)),
];
const usedPackages = new Set();
const importPattern =
  /(?:from\s*|import\s+|import\s*\(|require\s*\()\s*["']([^"']+)["']/g;

for (const file of auditedFiles) {
  const content = await readFile(file, "utf8");

  for (const match of content.matchAll(importPattern)) {
    const packageName = packageNameFromSpecifier(match[1]);

    if (packageName) {
      usedPackages.add(packageName);
    }
  }
}

const scriptCommands = Object.values(packageJson.scripts ?? {}).join(" ");
const declaredDependencies = Object.keys(packageJson.dependencies ?? {});
const unusedDependencies = declaredDependencies.filter(
  (dependency) =>
    !ignoredDependencies.has(dependency) &&
    !usedPackages.has(dependency) &&
    !scriptUsesDependency(scriptCommands, dependency),
);

if (unusedDependencies.length === 0) {
  console.log("Aucune dépendance applicative manifestement inutilisée détectée.");
  process.exit(0);
}

console.log(
  "Dépendances déclarées sans usage détecté dans src, la configuration ou les scripts npm :",
);
for (const dependency of unusedDependencies.sort()) {
  console.log(`- ${dependency}`);
}

console.log(
  "Vérifier les usages générés, externes ou chargés à l’exécution avant tout retrait.",
);
