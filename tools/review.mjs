// Review package: every letter (and every Widerspruch type) with the sample data,
// as DIN 5008 PDF and as one Markdown file for proofreading.
//   node tools/review.mjs [outDir]      (default: ../fightendo-review)
// SPDX-License-Identifier: GPL-3.0-or-later
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import vm from 'node:vm';
import { ROOT, modules } from './sync.mjs';

const out = resolve(process.argv[2] || join(ROOT, '..', 'fightendo-review'));
mkdirSync(out, { recursive: true });
const sb = { console, Date, Math, JSON, atob, Uint8Array, TextEncoder };
sb.window = sb;
sb.localStorage = { getItem: () => null };
vm.createContext(sb);
const { locales, countries } = modules();
for (const f of ['js/core.js', 'js/pdf.js', ...locales, ...countries]) vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), sb);
const FE = sb.FightEndo;
const sample = JSON.parse(readFileSync(join(ROOT, 'tests/fixtures/sample-state.json'), 'utf8'));
sample.symptoms.notes = 'Ich musste deswegen meine Ausbildung unterbrechen.';
sample.person.name = 'Maria Muster';

let md = '# FightEndo – alle Briefe zur Prüfung\n\nErzeugt mit Beispieldaten (`tests/fixtures/sample-state.json`), Standard-Optionen. Die PDFs liegen daneben.\n\n';
for (const file of countries) {
  const j = FE.jurisdictions[file.split('/')[1]];
  const variants = [];
  for (const letter of j.letters) {
    const kindField = (letter.fields || []).find((f) => f.id === 'kind' && f.type === 'select');
    const claims = { diagnostics: 'MRT des Beckens', treatment: 'operative Behandlung in einem zertifizierten Endometriosezentrum', drug: 'alternative Hormontherapie (Kombinationspräparat im Langzyklus)', rehab: 'stationäre Rehabilitation in einer Endometriose-Reha-Klinik' };
    if (kindField) kindField.options.forEach((o) => variants.push([letter, { kind: o.value, decision: 'k1', claim: claims[o.value] || '' }, o.label]));
    else variants.push([letter, { decision: 'k1', doctor: 'Praxis Dr. Beispiel', doctorStreet: 'Praxisweg 3', doctorZipCity: '10119 Berlin' }, '']);
  }
  variants.forEach(([letter, fields, label], i) => {
    const st = FE.merge(FE.emptyState(), JSON.parse(JSON.stringify(sample)));
    if (fields.kind && fields.kind !== 'diagnostics') Object.assign(st.symptoms, { diagnosis: 'diagnosed', diagnosisYear: '2022' });
    if (fields.kind) st.decisions[0].what = fields.claim;
    st.letter.options[letter.id] = FE.optionDefaults(st, j, letter);
    st.letter.fields[letter.id] = fields;
    const res = FE.buildLetter(st, j, letter);
    const name = String(i + 1).padStart(2, '0') + '-' + letter.id + (fields.kind ? '-' + fields.kind : '');
    const opts = { title: letter.title, anchor: j.closing, pageLabel: j.pageLabel };
    let text;
    if (typeof res === 'string') {
      text = res;
      writeFileSync(join(out, name + '.pdf'), FE.pdf.build(res, Object.assign(opts, { boldTitle: true })));
    } else {
      const editable = res.subject + '\n\n' + res.body;
      text = [res.sender.join('\n'), res.recipient.join('\n'), res.info.map((r) => r.join(': ')).join('\n'), editable].join('\n\n');
      writeFileSync(join(out, name + '.pdf'), FE.pdf.buildLetter(res, editable, opts));
    }
    md += '## ' + (i + 1) + '. ' + letter.title + (label ? ' – ' + label : '') + '\n\n' + letter.description + '\n\nOptionen: ' +
      (letter.options || []).map((o) => (st.letter.options[letter.id][o.id] ? '☑ ' : '☐ ') + o.label).join(' · ') +
      '\n\n```text\n' + text + '\n```\n\n';
    console.log('✓ ' + name + '.pdf');
  });
}
writeFileSync(join(out, 'Briefe-zur-Pruefung.md'), md);
console.log('✓ ' + join(out, 'Briefe-zur-Pruefung.md'));
