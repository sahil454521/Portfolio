// How much script the first paint waits for: the entry module dist/index.html
// loads, plus every chunk it imports statically (modulepreload), gzipped.
// Lazy chunks are not counted; they arrive after the page is up.
// Prints BUNDLE PASS under the budget. node bundle.mjs [budgetKB=150]
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const budget = Number(process.argv[2] || 150);
const html = readFileSync('dist/index.html', 'utf8');
const files = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
let total = 0;
for (const f of new Set(files)) {
  const kb = gzipSync(readFileSync('dist' + f)).length / 1024;
  total += kb;
  console.log(`${f}  ${kb.toFixed(1)} kB gz`);
}
console.log(`first-paint script: ${total.toFixed(1)} kB gz (budget ${budget})`);
console.log(total > 0 && total < budget ? 'BUNDLE PASS' : 'BUNDLE FAIL');
process.exit(total > 0 && total < budget ? 0 : 1);
