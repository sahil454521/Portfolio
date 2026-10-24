// Commits on this branch that are not on origin/main must carry no AI
// attribution: no co-author trailer, session link or generated-with line, and
// no AI author or committer. Prints ATTRIBUTION PASS when clean.
import { execFileSync } from 'node:child_process';

const base = process.argv[2] || 'origin/main';
const log = execFileSync('git', ['log', `${base}..HEAD`, '--format=%H%x1f%an <%ae>%x1f%cn <%ce>%x1f%B%x1e'], { encoding: 'utf8' });
const commits = log.split('\x1e').map((c) => c.trim()).filter(Boolean);
const bad = commits.filter((c) => /claude|anthropic|generated with \[/i.test(c));
console.log(`${commits.length} commit(s) beyond ${base}`);
bad.forEach((c) => console.log('  carries attribution:', c.split('\x1f')[0].slice(0, 9)));
console.log(bad.length ? 'ATTRIBUTION FAIL' : 'ATTRIBUTION PASS');
process.exit(bad.length ? 1 : 0);
