// Break-test: every letter × every option combination × nasty personas.
//   npm run stress
// Checks each generated letter and PDF: no crashes, no undefined/NaN/Invalid Date,
// structurally valid PDF (xref offsets), acceptable speed, and options that actually
// change the text ("dead" options are reported).
// SPDX-License-Identifier: GPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { ROOT, modules } from './sync.mjs';

const sb = { console, Date, Math, JSON, atob, btoa, Uint8Array, String, Object, Array, Number, RegExp, Error, TextEncoder, TextDecoder };
sb.window = sb;
sb.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(sb);
const { locales, countries } = modules();
for (const f of ['js/core.js', 'js/pdf.js', ...locales, ...countries]) vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), sb, { filename: f });
const FE = sb.FightEndo;
const sample = JSON.parse(readFileSync(join(ROOT, 'tests/fixtures/sample-state.json'), 'utf8'));

/* ---------- personas ---------- */
const nasty = '<script>alert(1)</script> "quotes" & \'apos\' (Klammer) \\backslash\\ 😖🩸 Łódź Żółć İğdır مرحبا Привет ​‮';
const long = 'Sehr-lange-Wortkette-ohne-Leerzeichen-'.repeat(120);
const allSymptoms = Object.fromEntries(FE.SYMPTOMS.map((s) => [s.id, true]));
const personas = {
  empty: {},
  sample: sample,
  nasty: {
    person: { name: nasty, street: nasty, zipCity: '12345 ' + nasty, birthdate: '2026-02-30', insuranceNumber: nasty, insurer: nasty, insurerStreet: '', insurerZipCity: '' },
    symptoms: { checked: allSymptoms, dysmenorrheaNrs: 'abc', onsetYear: '3000', missedDays: '-3', emergencyVisits: '1e9', painkillers: nasty, painkillerEffect: 'bogus', hormones: long, hormoneEffect: 'none', notes: nasty + '\n\n' + long },
    diary: [{ id: 'x', date: 'garbage', pain: '11', missed: true }, { id: 'y', date: '', pain: '-5' }, { id: 'z', date: '2026-13-45', pain: 'NaN' }],
    encounters: [{ id: 'e', date: 'not-a-date', who: nasty, specialty: '', said: long, refused: nasty, verbatim: true, witness: nasty }],
    decisions: [{ id: 'k', date: '', ref: '', what: '', reason: '...', status: 'open' }]
  },
  huge: {
    person: sample.person,
    symptoms: Object.assign({}, sample.symptoms, { checked: allSymptoms, onsetYear: '1990' }),
    diary: Array.from({ length: 2000 }, (_, i) => ({ id: 'd' + i, date: FE.isoDate(new Date(2021, 0, 1 + i)), pain: String(i % 11), bleeding: 'medium', missed: i % 3 === 0 })),
    encounters: Array.from({ length: 150 }, (_, i) => ({ id: 'e' + i, date: FE.isoDate(new Date(2015, 0, 1 + i * 20)), who: 'Praxis ' + i, specialty: 'Gynäkologie', said: 'Das ist normal (' + i + ').', refused: 'Ultraschall', verbatim: i % 2 === 0 })),
    decisions: Array.from({ length: 40 }, (_, i) => ({ id: 'k' + i, date: FE.isoDate(new Date(2020, i, 5)), ref: 'AZ-' + i, what: 'MRT', reason: 'Nicht notwendig.', status: 'open' }))
  }
};

/* ---------- PDF structure check ---------- */
function checkPdf(bytes) {
  const s = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  if (!s.startsWith('%PDF-1.4') || !s.trimEnd().endsWith('%%EOF')) return 'bad header/trailer';
  const sx = /startxref\n(\d+)\n%%EOF\s*$/.exec(s);
  if (!sx || !s.startsWith('xref', +sx[1])) return 'startxref does not point to xref';
  const xref = s.slice(+sx[1]);
  const count = +(/xref\n0 (\d+)/.exec(xref) || [])[1];
  const entries = xref.split('\n').slice(2, 2 + count);
  for (let n = 1; n < count; n++) {
    const off = parseInt(entries[n], 10);
    if (!s.startsWith(n + ' 0 obj', off)) return 'xref offset of object ' + n + ' is wrong';
  }
  for (const m of s.matchAll(/<< \/Length (\d+) >>\nstream\n/g)) {
    const start = m.index + m[0].length;
    if (s.slice(start + +m[1], start + +m[1] + 10) !== '\nendstream') return 'stream length mismatch';
  }
  return null;
}

/* ---------- run ---------- */
const problems = new Map();
const note = (key, msg) => { if (!problems.has(key)) problems.set(key, msg); };
let runs = 0, pdfs = 0, slowest = 0, slowestName = '';
const t0 = Date.now();

for (const file of countries) {
  const j = FE.jurisdictions[file.split('/')[1]];
  for (const letter of j.letters) {
    const optIds = (letter.options || []).map((o) => o.id);
    const combos = Math.min(1 << optIds.length, 1024);
    for (const [pname, pdata] of Object.entries(personas)) {
      // All combinations for normal data; for the huge persona only none / all / every single option.
      const masks = pname === 'huge' ? [0, combos - 1, ...optIds.map((_, i) => 1 << i)] : Array.from({ length: combos }, (_, i) => i);
      for (const mask of masks) {
        const st = FE.merge(FE.emptyState(), JSON.parse(JSON.stringify(pdata)));
        st.letter.options[letter.id] = Object.fromEntries(optIds.map((o, i) => [o, !!(mask & (1 << i))]));
        st.letter.extra[letter.id] = pname === 'nasty' ? nasty : (mask % 2 ? 'Zusatz.' : '');
        st.letter.fields[letter.id] = {};
        for (const f of letter.fields || []) st.letter.fields[letter.id][f.id] = f.type === 'decision' ? ((st.decisions[0] || {}).id || 'missing')
          : f.type === 'select' ? f.options[mask % f.options.length].value : (pname === 'nasty' ? nasty : '');
        const where = j.id + '/' + letter.id + ' [' + pname + ']';
        let res;
        const t = Date.now();
        try { res = FE.buildLetter(st, j, letter); runs++; }
        catch (e) { note(where + ' crash', 'build() crashed: ' + e.message); continue; }
        const head = typeof res === 'object' ? res : null;
        const text = head ? res.subject + '\n\n' + res.body : res;
        const all = head ? [res.sender, res.recipient, (res.info || []).flat()].flat().join(' ') + ' ' + text : text;
        const bad = /undefined|NaN|\[object |Invalid Date|null\b/.exec(all);
        if (bad) note(where + ' bad:' + bad[0], 'text contains "' + bad[0] + '" (options ' + mask.toString(2) + ')');
        // Implausible input must never reach a letter.
        if (pname === 'nasty') for (const junk of ['seit 3000', '1e9', 'ca. -3', '30.02.2026', 'garbage', 'Wert von 11']) if (all.includes(junk)) note(where + ' junk:' + junk, 'implausible input "' + junk + '" appears in the letter');
        if (mask === 0 || mask === combos - 1 || (pname === 'nasty' && mask % 97 === 0)) {
          try {
            const pdf = head ? FE.pdf.buildLetter(head, text, { anchor: j.closing, pageLabel: j.pageLabel })
              : FE.pdf.build(text, { anchor: j.closing, pageLabel: j.pageLabel });
            pdfs++;
            const err = checkPdf(pdf);
            if (err) note(where + ' pdf', 'invalid PDF: ' + err);
          } catch (e) { note(where + ' pdf crash', 'PDF crashed: ' + e.message); }
        }
        const dt = Date.now() - t;
        if (dt > slowest) { slowest = dt; slowestName = where; }
      }
    }
    // Dead options: switching one option alone (sample persona, rest default) must change the text.
    const base = FE.merge(FE.emptyState(), JSON.parse(JSON.stringify(sample)));
    base.letter.fields[letter.id] = { decision: 'k1' };
    const defaults = FE.optionDefaults(base, j, letter);
    const render = (opts) => {
      const st = JSON.parse(JSON.stringify(base));
      st.letter.options[letter.id] = opts;
      const r = FE.buildLetter(st, j, letter);
      return typeof r === 'object' ? r.subject + r.body : r;
    };
    for (const o of optIds) {
      const on = render(Object.assign({}, defaults, { [o]: true }));
      const off = render(Object.assign({}, defaults, { [o]: false }));
      if (on === off) note(j.id + '/' + letter.id + ' dead:' + o, 'option "' + o + '" changes nothing with the sample data');
    }
  }
  // Deadline with broken dates must not produce Invalid Date.
  if (j.objectionDeadline) {
    for (const d of ['', 'garbage', '2026-02-30', '2026-13-01']) {
      const r = j.objectionDeadline(d, FE);
      if (r && isNaN(r)) note(j.id + ' deadline ' + d, 'objectionDeadline("' + d + '") returns Invalid Date');
    }
  }
}

for (const [, msg] of [...problems].sort()) console.log('✗ ' + msg.padEnd(0) + '  ← ' + [...problems].find((p) => p[1] === msg)[0]);
console.log((problems.size ? '✗' : '✓') + ' ' + runs + ' letters and ' + pdfs + ' PDFs generated in ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s · slowest ' + slowest + ' ms (' + slowestName + ') · ' + problems.size + ' problem(s)');
process.exit(problems.size ? 1 : 0);
