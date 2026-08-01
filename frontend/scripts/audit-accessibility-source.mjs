import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const failures = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|jsx)$/.test(entry.name)) inspect(full);
  }
}

function inspect(file) {
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split('\n');
  lines.forEach((line, index) => {
    if (/<img\b/i.test(line) && !/\balt=/.test(line)) failures.push(`${file}:${index + 1} image sans alt`);
    if (/<button\b[^>]*>\s*<[^>]+>\s*<\/button>/i.test(line) && !/aria-label=|title=/.test(line)) {
      failures.push(`${file}:${index + 1} bouton icône sans nom accessible`);
    }
  });
}

walk(root);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Audit source accessibilité réussi');
