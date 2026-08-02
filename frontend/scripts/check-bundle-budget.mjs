import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsRoot = path.join(frontendRoot, "dist", "assets");
const maximumChunkBytes = 180 * 1024;
const maximumEntryBytes = 80 * 1024;

const assetNames = await readdir(assetsRoot);
const javascriptAssets = assetNames.filter((assetName) => assetName.endsWith(".js"));
const violations = [];

for (const assetName of javascriptAssets) {
  const assetPath = path.join(assetsRoot, assetName);
  const { size } = await stat(assetPath);

  if (size > maximumChunkBytes) {
    violations.push(
      `${assetName}: ${(size / 1024).toFixed(2)} kB dépasse la limite de 180 kB`,
    );
  }

  if (assetName.startsWith("index-") && size > maximumEntryBytes) {
    violations.push(
      `${assetName}: l’entrée ${(size / 1024).toFixed(2)} kB dépasse la limite de 80 kB`,
    );
  }
}

if (violations.length > 0) {
  console.error("Budget du bundle dépassé :");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

const largestAsset = await javascriptAssets.reduce(async (largestPromise, assetName) => {
  const largest = await largestPromise;
  const { size } = await stat(path.join(assetsRoot, assetName));

  if (!largest || size > largest.size) {
    return { assetName, size };
  }

  return largest;
}, Promise.resolve(null));

console.log(
  `Budget du bundle respecté. Plus gros chunk : ${largestAsset.assetName} (${(
    largestAsset.size / 1024
  ).toFixed(2)} kB).`,
);
