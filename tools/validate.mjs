// Checks every language and country file the way the app will use them.
// Run: npm run check   (sync check + this validator)
// Errors (✗) fail CI. Warnings (!) are shown for reviewers but don't fail.
// SPDX-License-Identifier: GPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { ROOT, modules } from './sync.mjs';

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(where + ': ' + msg);
const warn = (where, msg) => warnings.push(where + ': ' + msg);

// ---- load the app's modules in a sandbox, like the browser does ----
const sandbox = { console, Date, Math, JSON, atob, Uint8Array, String, Object, Array, Number, RegExp, Error };
sandbox.window = sandbox;
sandbox.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(sandbox);
const { locales, countries } = modules();
function load(file) {
  try { vm.runInContext(readFileSync(join(ROOT, file), 'utf8'), sandbox, { filename: file }); }
  catch (e) { err(file, 'does not load: ' + e.message); }
}
['js/core.js', 'js/pdf.js', ...locales, ...countries].forEach(load);
const FE = sandbox.FightEndo;

// ---- languages ----
const REF = 'de';
const ref = FE.locales[REF];
const placeholders = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(',');
for (const file of locales) {
  const id = file.slice(5, -3);
  const L = FE.locales[id];
  if (!L) { err(file, 'must call FightEndo.registerLocale(\'' + id + '\', {...})'); continue; }
  if (!L['lang.name']) err(file, 'missing "lang.name" (the language’s own name, e.g. "Français")');
  if (id === REF) continue;
  for (const key of Object.keys(ref)) {
    if (!(key in L)) err(file, 'missing key "' + key + '"');
    else if (placeholders(L[key]) !== placeholders(ref[key])) err(file, 'key "' + key + '" must contain the placeholders ' + (placeholders(ref[key]) || '(none)'));
    else if (id !== 'en' && FE.locales.en && L[key] === FE.locales.en[key] && /[a-z]{4}/i.test(L[key]) && key !== 'nav.start') warn(file, 'probably untranslated: "' + key + '"');
  }
  for (const key of Object.keys(L)) if (!(key in ref)) warn(file, 'unknown key "' + key + '" (not in i18n/' + REF + '.js)');
}

// ---- countries ----
const SOURCE_TYPES = ['law', 'rights', 'case', 'guideline', 'study', 'media'];
const FIELD_TYPES = ['text', 'textarea', 'decision', 'date', 'select'];
const sample = JSON.parse(readFileSync(join(ROOT, 'tests/fixtures/sample-state.json'), 'utf8'));
const empty = FE.emptyState();

for (const file of countries) {
  const id = file.split('/')[1];
  const j = FE.jurisdictions[id];
  if (!j) { err(file, 'must call FightEndo.registerJurisdiction({ id: \'' + id + '\', ... }) – id must equal the folder name'); continue; }
  for (const k of ['name', 'language', 'lastReviewed', 'sources', 'letters']) if (!j[k]) err(file, 'missing "' + k + '"');
  if (j.language && !FE.locales[j.language]) err(file, 'language "' + j.language + '" has no i18n/' + j.language + '.js (needed for symptom names in letters)');
  if (j.lastReviewed && !/^\d{4}-\d{2}$/.test(j.lastReviewed)) err(file, 'lastReviewed must look like 2026-09');
  if (!j.closing) warn(file, 'no "closing" phrase – signatures cannot be placed in PDFs');
  if (typeof j.dateFormat !== 'function') warn(file, 'no dateFormat – dates will show as YYYY-MM-DD');

  for (const [sid, s] of Object.entries(j.sources || {})) {
    const w = file + ' source "' + sid + '"';
    if (!SOURCE_TYPES.includes(s.type)) errors.push(w + ': type must be one of ' + SOURCE_TYPES.join(', '));
    if (!s.short) errors.push(w + ': missing "short" (citation used in letters)');
    if (!s.title) errors.push(w + ': missing "title"');
    if (!/^https:\/\//.test(s.url || '')) errors.push(w + ': url must start with https://');
    if (s.type === 'study' && !/doi\.org|pubmed|ncbi|pmc/.test(s.url || '')) warnings.push(w + ': studies should link a DOI or PubMed');
  }
  for (const r of j.resources || []) if (!/^https:\/\//.test(r.url || '')) err(file, 'resource "' + r.name + '" url must start with https://');
  if (j.sendingTips && !Array.isArray(j.sendingTips)) err(file, 'sendingTips must be a list of strings');

  if (j.objectionDeadline) {
    const d = j.objectionDeadline('2026-01-27', FE);
    if (!(d instanceof sandbox.Date || d instanceof Date) || isNaN(d)) err(file, 'objectionDeadline must return a Date');
  }

  const ids = new Set();
  for (const letter of j.letters || []) {
    const w = file + ' letter "' + letter.id + '"';
    if (!letter.id || ids.has(letter.id)) errors.push(w + ': missing or duplicate id');
    ids.add(letter.id);
    if (!letter.title || !letter.description) errors.push(w + ': needs title and description');
    if (typeof letter.build !== 'function') { errors.push(w + ': build(ctx) is missing'); continue; }
    for (const f of letter.fields || []) {
      if (!FIELD_TYPES.includes(f.type)) errors.push(w + ' field "' + f.id + '": type must be ' + FIELD_TYPES.join('/'));
      if (f.type === 'select' && !(Array.isArray(f.options) && f.options.length && f.options.every((x) => x.value && x.label))) errors.push(w + ' field "' + f.id + '": select needs options [{ value, label }]');
    }
    const optIds = (letter.options || []).map((o) => o.id);
    if (new Set(optIds).size !== optIds.length) errors.push(w + ': duplicate option ids');

    // Build the letter with an empty state, the sample, all options on and all off.
    const variants = [];
    for (const [label, base] of [['empty data', empty], ['sample data', sample]]) {
      for (const mode of ['defaults', 'all on', 'all off']) {
        const st = JSON.parse(JSON.stringify(FE.merge(FE.emptyState(), base)));
        const defaults = FE.optionDefaults(st, j, letter);
        st.letter.options[letter.id] = mode === 'defaults' ? defaults
          : Object.fromEntries(optIds.map((o) => [o, mode === 'all on']));
        st.letter.extra[letter.id] = label === 'sample data' ? 'EXTRA-MARKER' : '';
        if (label === 'sample data') {
          st.letter.fields[letter.id] = {};
          for (const f of letter.fields || []) st.letter.fields[letter.id][f.id] = f.type === 'decision' ? (st.decisions[0] || {}).id : (f.type === 'select' ? (f.options[0] || {}).value : 'FIELD-' + f.id);
        }
        variants.push([label + ', ' + mode, st]);
      }
    }
    for (const [label, st] of variants) {
      const unknown = new Set();
      let res;
      try { res = FE.buildLetter(st, j, letter, (x) => unknown.add(x)); }
      catch (e) { errors.push(w + ' (' + label + '): build() crashed – ' + e.message); continue; }
      // build() returns plain text (a document) or a DIN letter { sender, recipient, info, subject, body }.
      let text = res, head = null;
      if (res && typeof res === 'object') {
        const ok = Array.isArray(res.sender) && Array.isArray(res.recipient) && Array.isArray(res.info || []) &&
          typeof res.subject === 'string' && typeof res.body === 'string';
        if (!ok) { errors.push(w + ' (' + label + '): letter object needs sender[], recipient[], info[[label, value]], subject, body'); continue; }
        if ((res.info || []).some((r) => !Array.isArray(r) || r.length !== 2)) errors.push(w + ': info rows must be [label, value]');
        if (res.recipient.length > 6) warnings.push(w + ': recipient has more than 6 lines – does not fit the window envelope');
        head = res;
        text = res.subject + '\n\n' + res.body;
        const all = [res.sender.join(' '), res.recipient.join(' '), (res.info || []).map((r) => r.join(' ')).join(' ')].join(' ');
        if (/undefined|NaN|\[object /.test(all)) errors.push(w + ' (' + label + '): letter head contains undefined/NaN');
      }
      if (typeof text !== 'string' || text.length < 50) { errors.push(w + ' (' + label + '): build() must return the letter text or a letter object'); continue; }
      if (/undefined|NaN|\[object /.test(text)) errors.push(w + ' (' + label + '): text contains undefined/NaN/[object]');
      if (unknown.size) errors.push(w + ': cites unknown source(s) ' + [...unknown].join(', '));
      if (label === 'sample data, defaults' && !text.includes('EXTRA-MARKER')) warnings.push(w + ': ignores ctx.extra (the user’s own addition)');
      if (label === 'sample data, defaults') {
        try {
          const pdf = head ? FE.pdf.buildLetter(head, text, { title: letter.title, anchor: j.closing })
            : FE.pdf.build(text, { title: letter.title, anchor: j.closing });
          const magic = String.fromCharCode(...pdf.slice(0, 5));
          if (magic !== '%PDF-') errors.push(w + ': PDF export failed');
          const unsupported = [...text].filter((ch) => ch.charCodeAt(0) > 255 && !'€‚„…‘’“”•–—ŒœŠšŽžŸ≥≤→'.includes(ch)).length;
          if (unsupported > text.length * 0.02) warnings.push(w + ': many characters outside Windows-1252 – built-in PDF will replace them; users should use "Print / save as PDF"');
        } catch (e) { errors.push(w + ': PDF export crashed – ' + e.message); }
      }
    }
  }
  if (!(j.letters || []).length) err(file, 'needs at least one letter');
}

// ---- report ----
for (const w of [...new Set(warnings)]) console.log('! ' + w);
for (const e of [...new Set(errors)]) console.log('✗ ' + e);
console.log((errors.length ? '✗' : '✓') + ' ' + locales.length + ' language(s), ' + countries.length + ' country file(s) checked – ' +
  errors.length + ' error(s), ' + warnings.length + ' warning(s)');
process.exit(errors.length ? 1 : 0);
