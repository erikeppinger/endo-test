// Evaluation: generates the letters for tests/cases/cases.json, checks each against its
// expectations and writes a readable report to docs/evaluation.md.
//   npm run eval
// SPDX-License-Identifier: GPL-3.0-or-later
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { ROOT, modules } from './sync.mjs';

const sb = { console, Date, Math, JSON, atob, Uint8Array, TextEncoder };
sb.window = sb;
sb.localStorage = { getItem: () => null };
vm.createContext(sb);
const { locales, countries } = modules();
for (const f of ['js/core.js', ...locales, ...countries]) vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), sb);
const FE = sb.FightEndo;
const { cases } = JSON.parse(readFileSync(join(ROOT, 'tests/cases/cases.json'), 'utf8'));

let report = '# Evaluation: Briefgenerator gegen Fallbeispiele\n\n' +
  'Automatisch erzeugt von `npm run eval` aus `tests/cases/cases.json`. Die Fälle sind anonymisierte, zusammengesetzte Szenarien nach öffentlich berichteten Mustern.\n\n';
let failed = 0;
const rows = [];
const bodies = [];
for (const c of cases) {
  const j = FE.jurisdictions[c.jurisdiction || 'de'];
  const letter = j.letters.find((l) => l.id === c.letter);
  const st = FE.merge(FE.emptyState(), c.state);
  st.letter.options[letter.id] = FE.optionDefaults(st, j, letter);
  st.letter.fields[letter.id] = c.fields || {};
  const res = FE.buildLetter(st, j, letter);
  const text = typeof res === 'string' ? res : [res.sender.join('\n'), res.recipient.join('\n'), res.info.map((r) => r.join(': ')).join('\n'), res.subject, res.body].join('\n\n');
  const misses = (c.expect.contains || []).filter((s) => !text.includes(s)).map((s) => 'fehlt: ' + s);
  const extra = (c.expect.notContains || []).filter((s) => text.includes(s)).map((s) => 'unerwünscht: ' + s);
  const problems = misses.concat(extra);
  if (problems.length) failed++;
  rows.push('| ' + c.id + ' | ' + c.letter + ' | ' + (problems.length ? '✗ ' + problems.join('; ') : '✓') + ' |');
  bodies.push('## ' + c.title + '\n\n**Muster:** ' + c.pattern + (c.sources.length ? '  \n**Quellen:** ' + c.sources.map((s) => '<' + s + '>').join(', ') : '') +
    '\n\n**Prüfung:** ' + (problems.length ? problems.join('; ') : 'alle Erwartungen erfüllt') + '\n\n```text\n' + text + '\n```\n');
  console.log((problems.length ? '✗ ' : '✓ ') + c.id + (problems.length ? '\n    ' + problems.join('\n    ') : ''));
}
report += '| Fall | Brief | Ergebnis |\n|---|---|---|\n' + rows.join('\n') + '\n\n' + bodies.join('\n');
writeFileSync(join(ROOT, 'docs/evaluation.md'), report);
console.log((failed ? '✗ ' : '✓ ') + (cases.length - failed) + '/' + cases.length + ' cases pass · report: docs/evaluation.md');
process.exit(failed ? 1 : 0);
