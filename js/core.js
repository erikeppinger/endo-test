/* FightEndo – core: registries, data model, storage, helpers.
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Everything stays on this device. No network calls, ever. */
(function () {
  'use strict';

  const FE = (window.FightEndo = window.FightEndo || {});
  FE.locales = {};
  FE.jurisdictions = {};

  FE.registerLocale = function (id, dict) { FE.locales[id] = dict; };
  FE.registerJurisdiction = function (j) { FE.jurisdictions[j.id] = j; };

  /* Symptom catalogue. `cardinal` marks symptoms that NICE NG73 (1.2.1) and the
   * ESHRE 2022 guideline name as reasons to suspect endometriosis. Labels live in
   * the locale files (key `sym.<id>`), so every language can phrase them itself. */
  FE.SYMPTOMS = [
    { id: 'dysmenorrhea', cardinal: true, nrs: true },
    { id: 'chronicPelvicPain', cardinal: true },
    { id: 'dyspareunia', cardinal: true },
    { id: 'dyschezia', cardinal: true },
    { id: 'bowelCyclic', cardinal: true },
    { id: 'dysuria', cardinal: true },
    { id: 'hematuria', cardinal: true },
    { id: 'infertility', cardinal: true },
    { id: 'rectalBleeding' },
    { id: 'heavyBleeding' },
    { id: 'fatigue' },
    { id: 'shoulderChest' },
    { id: 'nausea' },
    { id: 'backLegPain' },
    { id: 'mentalHealth' }
  ];

  FE.emptyState = function () {
    return {
      version: 1,
      settings: { jurisdiction: 'de', locale: 'de', textSize: '1' },
      person: {
        name: '', street: '', zipCity: '', birthdate: '', insuranceNumber: '',
        insurer: '', insurerStreet: '', insurerZipCity: ''
      },
      symptoms: {
        checked: {},          // id -> true
        dysmenorrheaNrs: '',  // 0-10
        dailyImpact: false,   // pain stops daily activities
        onsetYear: '',
        missedDays: '',       // per month, rough
        emergencyVisits: '',
        diagnosis: '',        // '' | 'suspected' | 'diagnosed'
        diagnosisYear: '',
        painkillers: '', painkillerEffect: '',
        hormones: '', hormoneEffect: '',
        familyHistory: false,
        notes: ''
      },
      diary: [],       // {id,date,pain,bleeding,missed,notes}
      encounters: [],  // {id,date,who,specialty,said,refused,verbatim,witness}
      decisions: [],   // {id,date,ref,what,reason,status}
      // Per letter type: chosen options, field values, free text, current text and
      // the last auto-generated text (to know whether the user edited it by hand).
      letter: { type: '', options: {}, fields: {}, extra: {}, texts: {}, generated: {} },
      signature: null  // { dataUrl (JPEG), width, height } – only used for PDFs
    };
  };

  FE.hasSaved = function () {
    try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
  };

  /* ---------- storage (localStorage, this device only) ---------- */
  const KEY = 'fightendo.v1';

  FE.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return FE.emptyState();
      return FE.merge(FE.emptyState(), JSON.parse(raw));
    } catch (e) {
      console.warn('FightEndo: could not read local storage', e);
      return FE.emptyState();
    }
  };

  FE.save = function (state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { console.warn('FightEndo: could not write local storage', e); return false; }
  };

  FE.wipe = function () {
    try { localStorage.removeItem(KEY); localStorage.removeItem(ENC_KEY); } catch (e) { /* nothing to do */ }
  };

  /* ---------- optional encryption at rest (app lock) ----------
   * AES-256-GCM, key derived from the user's passphrase with PBKDF2-SHA-256
   * (600 000 iterations, random 16-byte salt). Uses the browser's / OS's Web Crypto.
   * The key lives only in memory while the app is unlocked; nothing about the
   * passphrase is stored. Forgotten passphrase = data cannot be recovered. */
  const ENC_KEY = 'fightendo.enc.v1';
  const ITER = 600000;
  const b64 = (buf) => { let s = ''; new Uint8Array(buf).forEach((b) => { s += String.fromCharCode(b); }); return btoa(s); };
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  FE.crypto = {
    available: function () { return !!(window.crypto && crypto.subtle); },
    deriveKey: async function (pass, salt, iter) {
      const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
      return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: iter || ITER },
        base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    },
    newSalt: function () { return crypto.getRandomValues(new Uint8Array(16)); },
    // Returns a JSON-safe envelope. The salt travels with the data, the key never does.
    encrypt: async function (key, salt, obj) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
      return { fightendo: 'encrypted', v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(ct) };
    },
    // Throws on a wrong passphrase (GCM authentication fails).
    decrypt: async function (pass, env) {
      const salt = unb64(env.salt);
      const key = await FE.crypto.deriveKey(pass, salt, env.iter);
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, key, unb64(env.data));
      return { state: JSON.parse(new TextDecoder().decode(pt)), key: key, salt: salt };
    }
  };

  FE.loadEncrypted = function () {
    try { const raw = localStorage.getItem(ENC_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  };

  // Writes the encrypted envelope and removes any plaintext copy.
  FE.saveEncrypted = function (env) {
    try { localStorage.setItem(ENC_KEY, JSON.stringify(env)); localStorage.removeItem(KEY); return true; }
    catch (e) { console.warn('FightEndo: could not write encrypted storage', e); return false; }
  };

  FE.removeEncrypted = function () {
    try { localStorage.removeItem(ENC_KEY); } catch (e) { /* ignore */ }
  };

  // Deep-merge saved data onto defaults so older backups gain new fields.
  FE.merge = function (base, over) {
    if (Array.isArray(base)) return Array.isArray(over) ? over : base;
    if (base && typeof base === 'object') {
      const out = Object.assign({}, base);
      if (over && typeof over === 'object') {
        for (const k of Object.keys(over)) {
          out[k] = k in base ? FE.merge(base[k], over[k]) : over[k];
        }
      }
      return out;
    }
    return over === undefined ? base : over;
  };

  /* ---------- small helpers ---------- */
  FE.uid = function () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  FE.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  FE.getPath = function (obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  };

  FE.setPath = function (obj, path, value) {
    const keys = path.split('.');
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (o[keys[i]] == null) o[keys[i]] = {};
      o = o[keys[i]];
    }
    o[keys[keys.length - 1]] = value;
  };

  FE.today = function () {
    const d = new Date();
    return FE.isoDate(d);
  };

  FE.isoDate = function (d) {
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  };

  // Real calendar dates only: '2026-02-30' or 'garbage' → null.
  FE.parseIso = function (s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
  };

  // A plausible whole number in [min, max] as string, otherwise '' (so letters skip it).
  FE.num = function (v, min, max) {
    if (v === '' || v == null) return '';
    const s = String(v).trim();
    if (!/^\d{1,4}$/.test(s)) return '';
    const n = parseInt(s, 10);
    return n >= min && n <= max ? String(n) : '';
  };

  const validDate = (iso, notFuture) => {
    const d = FE.parseIso(iso);
    if (!d) return '';
    if (notFuture && d > new Date()) return '';
    return iso;
  };

  /* What letters see: user input with implausible values removed, so a typo never
   * ends up in a letter as "pain 15 of 10" or "since the year 3000". */
  FE.sanitize = function (state) {
    const s = state.symptoms;
    const year = new Date().getFullYear();
    return {
      person: Object.assign({}, state.person, { birthdate: validDate(state.person.birthdate, true) }),
      symptoms: Object.assign({}, s, {
        dysmenorrheaNrs: FE.num(s.dysmenorrheaNrs, 0, 10),
        onsetYear: FE.num(s.onsetYear, year - 90, year),
        diagnosisYear: FE.num(s.diagnosisYear, year - 90, year),
        missedDays: FE.num(s.missedDays, 1, 31),
        emergencyVisits: FE.num(s.emergencyVisits, 1, 500)
      }),
      diary: state.diary.filter((r) => validDate(r.date)),
      encounters: state.encounters.map((e) => Object.assign({}, e, { date: validDate(e.date, true) })),
      decisions: state.decisions.map((d) => Object.assign({}, d, { date: validDate(d.date, true) }))
    };
  };

  FE.addDays = function (d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  // Calendar-month addition; clamps to the last day (31 Jan + 1 month = 28/29 Feb).
  FE.addMonths = function (d, n) {
    const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
    const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(d.getDate(), last));
    return r;
  };

  FE.nextWorkday = function (d) {
    const r = new Date(d);
    while (r.getDay() === 0 || r.getDay() === 6) r.setDate(r.getDate() + 1);
    return r;
  };

  /* Diary statistics used by letters. */
  FE.diaryStats = function (diary) {
    const rows = diary.filter((r) => r.date).sort((a, b) => a.date.localeCompare(b.date));
    if (!rows.length) return null;
    const pains = rows
      .filter((r) => r.pain !== '' && r.pain != null)
      .map((r) => Number(r.pain))
      .filter((n) => !isNaN(n) && n >= 0 && n <= 10);
    const avg = pains.length ? pains.reduce((a, b) => a + b, 0) / pains.length : null;
    return {
      entries: rows.length,
      from: rows[0].date,
      to: rows[rows.length - 1].date,
      avgPain: avg == null ? null : Math.round(avg * 10) / 10,
      maxPain: pains.length ? Math.max.apply(null, pains) : null,
      severeDays: pains.filter((n) => n >= 7).length,
      missedDays: rows.filter((r) => r.missed).length
    };
  };

  /* Everything a jurisdiction's letter.build(ctx) gets. Shared by the app and
   * tools/validate.mjs so contributors test exactly what users will see.
   * onUnknownCite(id) is called when a letter cites a source that doesn't exist. */
  FE.letterContext = function (state, j, letter, onUnknownCite) {
    const L = FE.locales[j.language] || {};
    const clean = FE.sanitize(state);
    const s = clean.symptoms;
    const byDate = (a, b) => (a.date || '').localeCompare(b.date || '');
    const fmt = (iso) => (FE.parseIso(iso) ? (j.dateFormat ? j.dateFormat(iso) : iso) : '');
    return {
      p: clean.person,
      s: s,
      symptomLabels: FE.SYMPTOMS.filter((x) => s.checked[x.id]).map((x) => L['sym.' + x.id] || x.id),
      stats: FE.diaryStats(clean.diary),
      encounters: clean.encounters.slice().sort(byDate),
      decisions: clean.decisions.slice().sort(byDate),
      opt: state.letter.options[letter.id] || {},
      f: state.letter.fields[letter.id] || {},
      extra: state.letter.extra[letter.id] || '',
      today: FE.today(),
      fmt: fmt,
      cite: (id) => {
        if (j.sources[id]) return j.sources[id].short;
        if (onUnknownCite) onUnknownCite(id);
        return '[' + id + ']';
      },
      t: L
    };
  };

  /* Builds a letter and appends a numbered list of every source it cites (laws, rulings,
   * guidelines, studies – with link or DOI), so readers can check each claim.
   * Returns a string (document) or a letter object { sender, recipient, info, subject, body }. */
  FE.buildLetter = function (state, j, letter, onUnknownCite) {
    const used = [];
    const ctx = FE.letterContext(state, j, letter, onUnknownCite);
    const cite = ctx.cite;
    ctx.cite = (id) => { if (j.sources[id] && used.indexOf(id) < 0) used.push(id); return cite(id); };
    const res = letter.build(ctx);
    const refs = FE.referenceList(j, used);
    if (!refs) return res;
    if (typeof res === 'string') return res + '\n\n' + refs;
    return Object.assign({}, res, { body: res.body + '\n\n' + refs });
  };

  FE.referenceList = function (j, ids) {
    if (!ids.length) return '';
    const lines = ids.map((id, i) => {
      const s = j.sources[id];
      const doi = /doi\.org\/(.+)$/.exec(s.url || '');
      return '[' + (i + 1) + '] ' + s.short + ': ' + s.title + '. ' + (doi ? 'DOI: ' + doi[1] + ' – ' : '') + s.url;
    });
    return (j.referencesHeading || 'Sources') + ':\n' + lines.join('\n');
  };

  FE.optionDefaults = function (state, j, letter) {
    const ctx = FE.letterContext(state, j, letter);
    const o = {};
    (letter.options || []).forEach((opt) => {
      o[opt.id] = typeof opt.default === 'function' ? !!opt.default(ctx) : !!opt.default;
    });
    return o;
  };

  FE.cardinalCount = function (state) {
    const c = state.symptoms.checked || {};
    return FE.SYMPTOMS.filter((s) => s.cardinal && c[s.id]).length;
  };
})();
