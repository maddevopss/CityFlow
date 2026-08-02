import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(frontendRoot, "src");
const packageJson = JSON.parse(
  await readFile(path.join(frontendRoot, "package.json"), "utf8"),
);

const sourceExtensions = new Set([".css", ".js", ".jsx", ".ts", ".tsx"]);
const ignoredDependencies = new Set(["react", "react-dom"]);

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
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

const sourceFiles = await collectSourceFiles(sourceRoot);
const usedPackages = new Set();
const importPattern = /(?:from\s*|import\s*\(|require\s*\()\s*["']([^"']+)["']/g;

for (const file of sourceFiles) {
  const content = await readFile(file, "utf8");

  for (const match of content.matchAll(importPattern)) {
    const packageName = packageNameFromSpecifier(match[1]);

    if (packageName) {
      usedPackages.add(packageName);
    }
  }
}

const declaredDependencies = Object.keys(packageJson.dependencies ?? {});
const unusedDependencies = declaredDependencies.filter(
  (dependency) =>
    !ignoredDependencies.has(dependency) && !usedPackages.has(dependency),
);

if (unusedDependencies.length === 0) {
  console.log("Aucune dépendance applicative manifestement inutilisée détectée.");
  process.exit(0);
}

console.log("Dépendances déclarées sans import détecté dans src :");
for (const dependency of unusedDependencies.sort()) {
  console.log(`- ${dependency}`);
}

console.log(
  "Vérifier les usages dynamiques, CSS ou de configuration avant tout retrait.",
);
