/* FightEndo – user interface. SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';

  const FE = window.FightEndo;
  const esc = FE.esc;
  let state = FE.load();
  let storageWarned = false;

  // App lock: when data is stored encrypted, start locked. `vault` holds the
  // in-memory AES key while unlocked; it is never written anywhere.
  let vault = null;          // { key, salt }
  let locked = !!FE.loadEncrypted();
  const LOCK_AFTER_MS = 60 * 1000;       // lock when the app was in the background this long
  const IDLE_LOCK_MS = 5 * 60 * 1000;    // or after 5 minutes without interaction
  const UI_LANG_KEY = 'fightendo.lang';  // only the UI language, so the lock screen speaks it
  const TEXT_SIZE_KEY = 'fightendo.textsize';  // likewise the text size (not sensitive)
  const TEXT_SIZES = ['0.9', '1', '1.15', '1.3', '1.5'];
  const BACKUP_REMIND_DAYS = 14;               // web version: remind to download a backup this often
  let backupSnoozed = false;                   // "Later" hides the reminder until the next visit

  function deviceLang() {
    const lang = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return FE.locales[lang] ? lang : (FE.locales.en ? 'en' : 'de');
  }
  // First start: follow the device language if we have it, otherwise English.
  if (locked) {
    let saved = null;
    try { saved = localStorage.getItem(UI_LANG_KEY); } catch (e) { /* ignore */ }
    state.settings.locale = saved && FE.locales[saved] ? saved : deviceLang();
    try { state.settings.textSize = localStorage.getItem(TEXT_SIZE_KEY) || '1'; } catch (e) { /* ignore */ }
  } else if (!FE.hasSaved()) {
    state.settings.locale = deviceLang();
  }

  const VIEWS = ['start', 'symptoms', 'diary', 'history', 'letter', 'sources', 'data'];
  const ALL_VIEWS = VIEWS.concat(['more', 'help', 'example']);
  // The four steps of the flow, for the "Step n of 4" indicator. The diary is optional.
  const FLOW = ['symptoms', 'diary', 'history', 'letter'];

  /* Bottom navigation on phones: 5 thumb-reachable targets. Diary lives under
   * "Symptoms", sources and data under "More". Icons are inline SVG (no fonts, no network). */
  const ICON = {
    start: '<path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
    symptoms: '<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>',
    history: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    letter: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 7 8.5-7"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'
  };
  const BOTTOM = [['start', ['start', 'example']], ['symptoms', ['symptoms', 'diary']], ['history', ['history']], ['letter', ['letter']], ['more', ['more', 'help', 'sources', 'data']]];
  // "Next" button at the end of each step of the flow.
  const NEXT = { symptoms: 'diary', diary: 'history', history: 'letter' };

  function nextButton(view) {
    const to = NEXT[view];
    return to ? '<div class="next"><button class="btn primary" data-action="go" data-view="' + to + '">' + esc(t('ui.next')) + ': ' + esc(t('nav.' + to)) + ' →</button></div>' : '';
  }

  // Segmented switch between two related pages (symptoms ↔ diary).
  function segmented(current, ids) {
    return '<div class="segmented" role="tablist">' + ids.map((id) =>
      '<a href="#' + id + '" role="tab"' + (id === current ? ' aria-selected="true" class="on"' : '') + '>' + esc(t('nav.' + id)) + '</a>').join('') + '</div>';
  }

  /* ---------- i18n & jurisdiction ---------- */
  function t(key, vars) {
    const L = FE.locales[state.settings.locale] || FE.locales.de;
    let s = L[key] != null ? L[key] : (FE.locales.de[key] != null ? FE.locales.de[key] : key);
    if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  function J() {
    return FE.jurisdictions[state.settings.jurisdiction] || FE.jurisdictions.de || Object.values(FE.jurisdictions)[0];
  }

  function fmt(iso) { return iso ? J().dateFormat(iso) : ''; }

  let saveTimer = null;
  function persist() {
    if (locked) return;
    try { localStorage.setItem(UI_LANG_KEY, state.settings.locale); localStorage.setItem(TEXT_SIZE_KEY, state.settings.textSize || '1'); } catch (e) { /* ignore */ }
    if (vault) {
      // Encrypted mode: debounce, then write only ciphertext.
      clearTimeout(saveTimer);
      saveTimer = setTimeout(flushEncrypted, 250);
      return;
    }
    if (!FE.save(state) && !storageWarned) {
      storageWarned = true;
      toast(t('data.storageFail'), 8000);
    }
  }

  async function flushEncrypted() {
    clearTimeout(saveTimer);
    if (!vault || locked) return;
    const env = await FE.crypto.encrypt(vault.key, vault.salt, state);
    if (!FE.saveEncrypted(env) && !storageWarned) { storageWarned = true; toast(t('data.storageFail'), 8000); }
    document.dispatchEvent(new CustomEvent('fightendo:saved'));
  }

  /* ---------- app lock ---------- */
  async function lockNow() {
    if (!vault) return;
    await flushEncrypted();
    vault = null;
    locked = true;
    const locale = state.settings.locale;
    state = FE.emptyState();               // drop decrypted data from memory
    state.settings.locale = locale;
    if (FE.native) FE.native.cleanup();
    render();
  }

  let hiddenAt = 0;
  let lastActivity = Date.now();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); if (vault) flushEncrypted(); }
    else if (vault && Date.now() - hiddenAt > LOCK_AFTER_MS) lockNow();
  });
  ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, () => { lastActivity = Date.now(); }, true));
  setInterval(() => { if (vault && Date.now() - lastActivity > IDLE_LOCK_MS) lockNow(); }, 15000);

  /* ---------- form helpers ---------- */
  /* Small "ⓘ" button that shows a one-paragraph explanation under a field. */
  let tipSeq = 0;
  function tipButton(key) {
    const id = 'tip-' + (++tipSeq);
    return { button: '<button type="button" class="tipbtn" data-action="tip" aria-expanded="false" aria-controls="' + id + '" aria-label="' + esc(t('tip.button')) + '">ⓘ</button>',
      text: '<p class="tip" id="' + id + '" hidden>' + esc(t(key)) + '</p>' };
  }

  function field(label, path, opts) {
    opts = opts || {};
    if (opts.tip) {
      const tip = tipButton(opts.tip);
      const inner = field(label, path, Object.assign({}, opts, { tip: null }));
      // The button goes next to the label (or the checkbox), the text below the input.
      if (opts.type === 'checkbox') return '<div class="tipwrap">' + inner.replace(/<\/label>$/, '</label>' + tip.button) + tip.text + '</div>';
      return inner.replace('</label>', '</label>' + tip.button).replace(/<\/div>$/, tip.text + '</div>');
    }
    const v = FE.getPath(state, path);
    const id = 'f-' + path.replace(/\./g, '-');
    const type = opts.type || 'text';
    let input;
    if (type === 'textarea') {
      input = '<textarea id="' + id + '" data-bind="' + path + '" rows="' + (opts.rows || 3) + '"' + (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') + '>' + esc(v) + '</textarea>';
    } else if (type === 'select') {
      input = '<select id="' + id + '" data-bind="' + path + '">' + opts.options.map((o) =>
        '<option value="' + esc(o.value) + '"' + (String(v) === String(o.value) ? ' selected' : '') + '>' + esc(o.label) + '</option>').join('') + '</select>';
    } else if (type === 'checkbox') {
      return '<label class="check"><input type="checkbox" id="' + id + '" data-bind="' + path + '"' + (v ? ' checked' : '') + '><span>' + esc(label) + '</span></label>';
    } else {
      input = '<input id="' + id + '" type="' + type + '" data-bind="' + path + '" value="' + esc(v) + '"' +
        (opts.min != null ? ' min="' + opts.min + '"' : '') + (opts.max != null ? ' max="' + opts.max + '"' : '') +
        (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') + (type === 'number' ? ' inputmode="numeric"' : '') + '>';
    }
    return '<div class="field' + (opts.wide ? ' wide' : '') + '"><label for="' + id + '">' + esc(label) + '</label>' + input + '</div>';
  }

  function effectOptions() {
    return ['', 'none', 'partial', 'good', 'side', 'never'].map((v) => ({ value: v, label: t('sym.effect.' + v) }));
  }

  /* ---------- views ---------- */
  const views = {};

  views.start = function () {
    const js = Object.values(FE.jurisdictions);
    const steps = ['start.step1', 'start.step2', 'start.step3', 'start.step4'];
    return '<section class="hero"><p class="eyebrow">FightEndo</p><h1>' + esc(t('start.title')) + '</h1><p class="lead">' + esc(t('start.lead')) + '</p>' +
      '<div class="actions"><button class="btn primary" data-action="go" data-view="symptoms">' + esc(t('start.begin')) + ' →</button>' +
      (J().example ? '<button class="btn" data-action="go" data-view="example">' + esc(t('start.example')) + '</button>' : '') + '</div>' +
      '<p class="privacy-line"><span aria-hidden="true">🔒</span> ' + esc(t('start.privacyLine')) + ' <a href="#help">' + esc(t('start.privacyMore')) + '</a></p></section>' +
      '<section class="panel accent"><h2>' + esc(t('start.why.title')) + '</h2><p>' + esc(t('start.why.text')) + '</p></section>' +
      '<section class="panel"><h2>' + esc(t('start.steps')) + '</h2><ol class="steps">' + steps.map((k) => '<li>' + esc(t(k)) + '</li>').join('') + '</ol>' +
      field(t('start.jurisdiction'), 'settings.jurisdiction', { type: 'select', options: js.map((j) => ({ value: j.id, label: j.name })) }) +
      '</section>' +
      '<div class="cards">' +
      '<article class="card warn"><h3>' + esc(t('start.disclaimer.title')) + '</h3><p>' + esc(t('start.disclaimer.text')) + '</p></article>' +
      '<article class="card"><h3>' + esc(t('start.open.title')) + '</h3><p>' + esc(t('start.open.text')) + '</p></article>' +
      '</div>';
  };

  /* Example letter: built from the country's fictional example person, never from (or into) the user's data. */
  views.example = function () {
    const j = J();
    const ex = j.example;
    const letter = ex && (j.letters || []).find((l) => l.id === ex.letter);
    let body = '';
    if (letter) {
      const st = FE.merge(FE.emptyState(), JSON.parse(JSON.stringify(ex.state)));
      st.settings.jurisdiction = j.id;
      st.letter.options[letter.id] = FE.optionDefaults(st, j, letter);
      const res = FE.buildLetter(st, j, letter);
      const head = typeof res === 'string' ? '' : '<div class="letter-head">' +
        '<div class="lh-sender">' + res.sender.map(esc).join('<br>') + '</div>' +
        '<div class="lh-row"><div class="lh-recipient">' + res.recipient.map(esc).join('<br>') + '</div>' +
        '<dl class="lh-info">' + (res.info || []).map((r) => '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>').join('') + '</dl></div></div>';
      const text = typeof res === 'string' ? res : res.subject + '\n\n' + res.body;
      body = '<section class="panel letter-out example-letter"><p class="muted">' + esc(letter.title) + '</p>' + head + '<pre class="example-text">' + esc(text) + '</pre></section>';
    }
    const buttons = '<div class="actions"><button class="btn primary" data-action="go" data-view="symptoms">' + esc(t('example.begin')) + ' →</button>' +
      '<button class="btn" data-action="go" data-view="start">' + esc(t('example.back')) + '</button></div>';
    return '<h1>' + esc(t('example.title')) + '</h1>' +
      '<aside class="panel accent example-note"><p><strong>' + esc(t('example.noteTitle')) + '</strong> ' + esc(t('example.note')) + '</p></aside>' +
      buttons + body + buttons;
  };

  /* "Step n of 4" above each page of the flow. */
  function progress(view) {
    const n = FLOW.indexOf(view);
    if (n < 0) return '';
    const name = t('nav.' + view) + (view === 'diary' ? ' (' + t('progress.optional') + ')' : '');
    return '<p class="progress" aria-label="' + esc(t('progress', { n: n + 1, total: FLOW.length, name: name })) + '">' +
      '<span class="progress-bar" aria-hidden="true">' + FLOW.map((v, i) => '<i class="' + (i <= n ? 'on' : '') + '"></i>').join('') + '</span>' +
      '<span>' + esc(t('progress', { n: n + 1, total: FLOW.length, name: name })) + '</span></p>';
  }

  /* "Why this matters" box at the top of a page; can be hidden, and shown again from Help. */
  function why(view) {
    if ((state.settings.hiddenWhy || []).indexOf(view) >= 0) return '';
    return '<aside class="why" data-why="' + view + '"><p><strong>' + esc(t('why.' + view + '.title')) + '</strong> ' + esc(t('why.' + view + '.text')) + '</p>' +
      '<button class="btn ghost small" data-action="hideWhy" data-view="' + view + '">' + esc(t('why.hide')) + '</button></aside>';
  }

  function symptomSummary() {
    const n = FE.cardinalCount(state);
    return '<h3>' + esc(t('sym.summaryTitle')) + '</h3><p>' + esc(n ? t('sym.summaryN', { n: n }) : t('sym.summary0')) + '</p><p class="muted">' + esc(t('sym.notDiagnosis')) + '</p>';
  }

  views.symptoms = function () {
    const list = FE.SYMPTOMS.map((s) => {
      let html = '<li class="sym' + (s.cardinal ? ' cardinal' : '') + '">' +
        field(t('sym.' + s.id), 'symptoms.checked.' + s.id, { type: 'checkbox' });
      if (s.cardinal) html += '<span class="badge">' + esc(t('sym.cardinalBadge')) + '</span>';
      return html + '</li>';
    }).join('');
    return progress('symptoms') + segmented('symptoms', ['symptoms', 'diary']) + '<h1>' + esc(t('sym.title')) + '</h1>' + why('symptoms') + '<p class="lead">' + esc(t('sym.lead')) + '</p>' +
      '<ul class="symlist">' + list + '</ul>' +
      '<section class="panel grid">' +
      field(t('sym.nrs'), 'symptoms.dysmenorrheaNrs', { type: 'number', min: 0, max: 10, tip: 'tip.nrs' }) +
      field(t('sym.diagnosis'), 'symptoms.diagnosis', { type: 'select', options: ['', 'suspected', 'diagnosed'].map((v) => ({ value: v, label: t('sym.diagnosis.' + v) })), tip: 'tip.diagnosis' }) +
      field(t('sym.diagnosisYear'), 'symptoms.diagnosisYear', { type: 'number', min: 1950, max: new Date().getFullYear() }) +
      field(t('sym.onsetYear'), 'symptoms.onsetYear', { type: 'number', min: 1950, max: new Date().getFullYear() }) +
      field(t('sym.missedDays'), 'symptoms.missedDays', { type: 'number', min: 0, max: 31, tip: 'tip.missedDays' }) +
      field(t('sym.emergencyVisits'), 'symptoms.emergencyVisits', { type: 'number', min: 0 }) +
      '<div class="wide">' + field(t('sym.dailyImpact'), 'symptoms.dailyImpact', { type: 'checkbox', tip: 'tip.dailyImpact' }) + '</div>' +
      field(t('sym.painkillers'), 'symptoms.painkillers') +
      field(t('sym.painkillerEffect'), 'symptoms.painkillerEffect', { type: 'select', options: effectOptions(), tip: 'tip.effect' }) +
      field(t('sym.hormones'), 'symptoms.hormones') +
      field(t('sym.hormoneEffect'), 'symptoms.hormoneEffect', { type: 'select', options: effectOptions(), tip: 'tip.effect' }) +
      '<div class="wide">' + field(t('sym.familyHistory'), 'symptoms.familyHistory', { type: 'checkbox' }) + '</div>' +
      field(t('sym.notes'), 'symptoms.notes', { type: 'textarea', wide: true }) +
      '</section>' +
      '<aside class="panel accent" data-derived="symptomSummary">' + symptomSummary() + '</aside>' +
      nextButton('symptoms');
  };

  function diaryStatsText() {
    const st = FE.diaryStats(state.diary);
    if (!st) return '';
    return esc(t('diary.stats', {
      entries: st.entries, from: fmt(st.from), to: fmt(st.to),
      avg: st.avgPain == null ? '–' : st.avgPain, max: st.maxPain == null ? '–' : st.maxPain,
      severe: st.severeDays, missed: st.missedDays
    }));
  }

  views.diary = function () {
    const rows = state.diary.map((r, i) => ({ r, i })).sort((a, b) => (b.r.date || '').localeCompare(a.r.date || ''));
    const bleed = ['', 'none', 'light', 'medium', 'heavy'].map((v) => ({ value: v, label: t('diary.bleed.' + v) }));
    const body = rows.length ? rows.map(({ r, i }) => {
      const p = 'diary.' + i + '.';
      return '<div class="row diary-row">' +
        field(t('diary.date'), p + 'date', { type: 'date' }) +
        field(t('diary.pain'), p + 'pain', { type: 'number', min: 0, max: 10 }) +
        field(t('diary.bleeding'), p + 'bleeding', { type: 'select', options: bleed }) +
        '<div class="field check-field">' + field(t('diary.missed'), p + 'missed', { type: 'checkbox' }) + '</div>' +
        field(t('diary.notes'), p + 'notes', { wide: true }) +
        '<button class="btn ghost small" data-action="remove" data-list="diary" data-id="' + esc(r.id) + '">' + esc(t('hist.remove')) + '</button>' +
        '</div>';
    }).join('') : '<p class="muted">' + esc(t('diary.empty')) + '</p>';
    return progress('diary') + segmented('diary', ['symptoms', 'diary']) + '<h1>' + esc(t('diary.title')) + '</h1>' + why('diary') + '<p class="lead">' + esc(t('diary.lead')) + '</p>' +
      '<p class="stats" data-derived="diaryStats">' + diaryStatsText() + '</p>' +
      '<button class="btn primary" data-action="add" data-list="diary">+ ' + esc(t('diary.add')) + '</button>' +
      '<div class="rows">' + body + '</div>' + nextButton('diary');
  }

  function deadlineText(d) {
    const j = J();
    if (!j.objectionDeadline || !d.date || d.status !== 'open') return '';
    const dl = j.objectionDeadline(d.date, FE);
    if (!dl) return '';
    const iso = FE.isoDate(dl);
    const past = iso < FE.today();
    return '<span class="' + (past ? 'deadline past' : 'deadline') + '">' + esc(t(past ? 'hist.deadlinePast' : 'hist.deadline', { date: fmt(iso) })) + '</span>';
  }

  views.history = function () {
    const enc = state.encounters.map((e, i) => {
      const p = 'encounters.' + i + '.';
      return '<div class="row card">' +
        field(t('hist.date'), p + 'date', { type: 'date' }) +
        field(t('hist.who'), p + 'who') +
        field(t('hist.specialty'), p + 'specialty') +
        field(t('hist.said'), p + 'said', { type: 'textarea', wide: true, rows: 2 }) +
        '<div class="wide">' + field(t('hist.verbatim'), p + 'verbatim', { type: 'checkbox', tip: 'tip.verbatim' }) + '</div>' +
        field(t('hist.refused'), p + 'refused', { type: 'textarea', wide: true, rows: 2 }) +
        field(t('hist.witness'), p + 'witness', { tip: 'tip.witness' }) +
        '<button class="btn ghost small" data-action="remove" data-list="encounters" data-id="' + esc(e.id) + '">' + esc(t('hist.remove')) + '</button></div>';
    }).join('') || '<p class="muted">' + esc(t('hist.emptyEnc')) + '</p>';

    const statusOpts = ['open', 'objected', 'closed'].map((v) => ({ value: v, label: t('hist.status.' + v) }));
    const dec = state.decisions.map((d, i) => {
      const p = 'decisions.' + i + '.';
      return '<div class="row card">' +
        field(t('hist.decDate'), p + 'date', { type: 'date' }) +
        field(t('hist.ref'), p + 'ref', { tip: 'tip.ref' }) +
        field(t('hist.status'), p + 'status', { type: 'select', options: statusOpts }) +
        field(t('hist.what'), p + 'what', { wide: true }) +
        field(t('hist.reason'), p + 'reason', { type: 'textarea', wide: true, rows: 2 }) +
        '<p class="wide" data-derived="deadline" data-id="' + esc(d.id) + '">' + deadlineText(d) + '</p>' +
        '<button class="btn ghost small" data-action="remove" data-list="decisions" data-id="' + esc(d.id) + '">' + esc(t('hist.remove')) + '</button></div>';
    }).join('') || '<p class="muted">' + esc(t('hist.emptyDec')) + '</p>';

    return progress('history') + '<h1>' + esc(t('hist.title')) + '</h1>' + why('history') + '<p class="lead">' + esc(t('hist.lead')) + '</p>' +
      '<h2>' + esc(t('hist.encounters')) + '</h2><button class="btn primary" data-action="add" data-list="encounters">+ ' + esc(t('hist.addEncounter')) + '</button><div class="rows">' + enc + '</div>' +
      '<h2>' + esc(t('hist.decisions')) + '</h2><button class="btn primary" data-action="add" data-list="decisions">+ ' + esc(t('hist.addDecision')) + '</button><div class="rows">' + dec + '</div>' + nextButton('history');
  };

  /* ---------- letters ---------- */
  function currentLetter() {
    return (J().letters || []).find((l) => l.id === state.letter.type) || null;
  }

  function letterCtx(letter) {
    return FE.letterContext(state, J(), letter);
  }

  // Fill in option defaults the first time a letter type is opened.
  function ensureLetterDefaults(letter) {
    const o = state.letter.options[letter.id] || (state.letter.options[letter.id] = {});
    if (!state.letter.fields[letter.id]) state.letter.fields[letter.id] = {};
    const defaults = FE.optionDefaults(state, J(), letter);
    Object.keys(defaults).forEach((id) => { if (!(id in o)) o[id] = defaults[id]; });
    (letter.fields || []).forEach((fd) => {
      if (fd.type === 'select' && !state.letter.fields[letter.id][fd.id] && (fd.options || []).length) state.letter.fields[letter.id][fd.id] = fd.options[0].value;
      if (fd.type === 'decision' && !state.letter.fields[letter.id][fd.id] && state.decisions.length) {
        state.letter.fields[letter.id][fd.id] = state.decisions[state.decisions.length - 1].id;
      }
    });
  }

  views.letter = function () {
    const j = J();
    const letter = currentLetter();
    let html = progress('letter') + '<h1>' + esc(t('letter.title')) + '</h1>' + why('letter') + '<p class="lead">' + esc(t('letter.lead')) + '</p>' +
      '<section class="panel">' +
      field(t('letter.type'), 'letter.type', { type: 'select', options: [{ value: '', label: t('letter.choose') }].concat(j.letters.map((l) => ({ value: l.id, label: l.title }))) });
    if (letter) html += '<p class="muted">' + esc(letter.description) + '</p>';
    html += '</section>';
    if (!letter) return html;

    ensureLetterDefaults(letter);
    const P = 'person.';
    html += '<details class="panel" open><summary>' + esc(t('letter.person')) + '</summary><div class="grid">' +
      field(t('letter.name'), P + 'name') + field(t('letter.birthdate'), P + 'birthdate', { type: 'date' }) +
      field(t('letter.street'), P + 'street') + field(t('letter.zipCity'), P + 'zipCity') +
      field(t('letter.insurer'), P + 'insurer') + field(t('letter.insuranceNumber'), P + 'insuranceNumber', { tip: 'tip.insuranceNumber' }) +
      field(t('letter.insurerStreet'), P + 'insurerStreet') + field(t('letter.insurerZipCity'), P + 'insurerZipCity') +
      '</div></details>';

    if (letter.fields && letter.fields.length) {
      html += '<section class="panel grid">' + letter.fields.map((fd) => {
        const path = 'letter.fields.' + letter.id + '.' + fd.id;
        if (fd.type === 'decision') {
          const opts = state.decisions.map((d) => ({ value: d.id, label: (d.date ? fmt(d.date) : '?') + (d.ref ? ' · ' + d.ref : '') + (d.what ? ' · ' + d.what : '') }));
          if (!opts.length) return '<p class="muted wide">' + esc(t('hist.emptyDec')) + ' <a href="#history">' + esc(t('nav.history')) + '</a></p>';
          return field(fd.label, path, { type: 'select', options: opts, wide: true });
        }
        if (fd.type === 'select') return field(fd.label, path, { type: 'select', options: fd.options || [], wide: true });
        return field(fd.label, path, { type: fd.type === 'textarea' ? 'textarea' : (fd.type === 'date' ? 'date' : 'text'), placeholder: fd.placeholder, wide: fd.type === 'textarea' });
      }).join('') + '</section>';
    }

    if (letter.options && letter.options.length) {
      const optTip = tipButton('tip.options');
      html += '<section class="panel"><h2>' + esc(t('letter.options')) + ' ' + optTip.button + '</h2>' + optTip.text +
        letter.options.map((o) => field(o.label, 'letter.options.' + letter.id + '.' + o.id, { type: 'checkbox' })).join('') + '</section>';
    }

    html += '<section class="panel">' + field(t('letter.extra'), 'letter.extra.' + letter.id, { type: 'textarea', rows: 3, wide: true, tip: 'tip.extra' }) + '</section>';

    // Rebuild on every visit (symptoms, diary or notes may have changed on other pages),
    // unless the user has edited the text by hand.
    if (!isEdited(letter)) { generateLetter(letter); persist(); }

    html += '<section class="panel letter-out">' +
      '<p class="letter-status" data-derived="letterStatus">' + letterStatus(letter) + '</p>' +
      '<div class="letter-head" data-derived="letterHead">' + letterHeadHtml(letter) + '</div>' +
      field(t('letter.text'), 'letter.texts.' + letter.id, { type: 'textarea', rows: 24, wide: true }) +
      '<p class="muted">' + esc(t('letter.langNote', { lang: (FE.locales[j.language] || {})['lang.name'] || j.language })) + '</p>' +
      '</section>';

    html += '<details class="panel"' + (state.signature ? ' open' : '') + '><summary>' + esc(t('letter.signature')) + '</summary>' +
      '<p class="muted">' + esc(t('tip.signature')) + '</p><div id="sig-root"></div></details>';

    html += '<section class="panel"><p class="muted">' + esc(t('letter.check')) + '</p><div class="actions">' +
      '<button class="btn primary" data-action="pdf">' + esc(t('letter.pdf')) + '</button>' +
      (canShareFiles() ? '<button class="btn" data-action="share">' + esc(t('letter.share')) + '</button>' : '') +
      '<button class="btn" data-action="rtf">' + esc(t('letter.rtf')) + '</button>' +
      (isNative() ? '' : '<button class="btn" data-action="print">' + esc(t('letter.print')) + '</button>') +
      '<button class="btn" data-action="copy">' + esc(t('letter.copy')) + '</button>' +
      '<button class="btn" data-action="download">' + esc(t('letter.download')) + '</button>' +
      '</div><p class="muted">' + esc(t(isNative() ? 'letter.saveNative' : 'letter.saveWeb')) + '</p></section>';

    if (j.sendingTips && j.sendingTips.length) {
      html += '<section class="panel accent"><h2>' + esc(t('letter.sending')) + '</h2><ul class="tips">' +
        j.sendingTips.map((tip) => '<li>' + esc(tip) + '</li>').join('') + '</ul></section>';
    }
    return html;
  };

  /* ---------- live letter ---------- */
  /* A template returns either plain text (a document) or a DIN letter object
   * { sender, recipient, info, subject, body }. The head (addresses, info block) always
   * follows the "your details" fields; subject + body form the editable text. */
  const heads = {};

  function buildLetterNow(letter) {
    const res = FE.buildLetter(state, J(), letter);
    if (typeof res === 'string') { heads[letter.id] = null; return res; }
    heads[letter.id] = { sender: res.sender || [], recipient: res.recipient || [], info: res.info || [] };
    return res.subject + '\n\n' + res.body;
  }

  function generateLetter(letter) {
    const text = buildLetterNow(letter);
    state.letter.texts[letter.id] = text;
    state.letter.generated[letter.id] = text;
    return text;
  }

  function currentHead(letter) {
    if (!(letter.id in heads)) buildLetterNow(letter);
    return heads[letter.id];
  }

  function letterHeadHtml(letter) {
    if (!letter) return '';
    const h = currentHead(letter);
    if (!h) return '';
    return '<div class="lh-sender">' + h.sender.map(esc).join('<br>') + '</div>' +
      '<div class="lh-row"><div class="lh-recipient">' + h.recipient.map(esc).join('<br>') + '</div>' +
      '<dl class="lh-info">' + h.info.map((r) => '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>').join('') + '</dl></div>';
  }

  function isEdited(letter) {
    const cur = state.letter.texts[letter.id];
    return !!cur && cur !== state.letter.generated[letter.id];
  }

  function letterStatus(letter) {
    if (!letter) return '';
    return isEdited(letter)
      ? '<span class="paused">' + esc(t('letter.paused')) + '</span> <button class="btn small" data-action="generate">' + esc(t('letter.generate')) + '</button>'
      : '<span class="live">● ' + esc(t('letter.live')) + '</span>';
  }

  // Called after any input on the letter view: rebuild the text unless the user edited it.
  function refreshLetter() {
    const letter = currentLetter();
    if (!letter || currentView() !== 'letter') return;
    if (isEdited(letter)) { buildLetterNow(letter); return; }   // head still follows the fields
    const text = generateLetter(letter);
    const ta = document.querySelector('[data-bind="letter.texts.' + letter.id + '"]');
    if (ta && ta.value !== text) ta.value = text;
  }

  function editableText() {
    const letter = currentLetter();
    return letter ? (state.letter.texts[letter.id] || '') : '';
  }

  // Full letter as plain text (copy, .txt, print, RTF).
  function currentText() {
    const letter = currentLetter();
    if (!letter) return '';
    const h = currentHead(letter);
    if (!h) return editableText();
    return [h.sender.join('\n'), h.recipient.join('\n'), h.info.map((r) => r[0] + ': ' + r[1]).join('\n'), editableText()].join('\n\n');
  }

  function canShareFiles() {
    if (isNative()) return true;
    try {
      return !!(navigator.canShare && window.File && navigator.canShare({ files: [new File(['x'], 'x.pdf', { type: 'application/pdf' })] }));
    } catch (e) { return false; }
  }

  function buildPdf() {
    const letter = currentLetter();
    const j = J();
    const opts = { title: letter ? letter.title : 'FightEndo', signature: state.signature, anchor: j.closing, pageLabel: j.pageLabel };
    const h = letter && currentHead(letter);
    return h ? FE.pdf.buildLetter(h, editableText(), opts) : FE.pdf.build(editableText(), Object.assign(opts, { boldTitle: true }));
  }

  // RTF opens in Word, LibreOffice, Pages and Google Docs – editable, still offline.
  function buildRtf() {
    const enc = (s) => s.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}')
      .replace(/[^\x00-\x7f]/g, (ch) => '\\u' + (ch.charCodeAt(0) > 32767 ? ch.charCodeAt(0) - 65536 : ch.charCodeAt(0)) + '?')
      .replace(/\n/g, '\\par\n');
    return '{\\rtf1\\ansi\\ansicpg1252\\deff0{\\fonttbl{\\f0 Arial;}}\\paperw11906\\paperh16838\\margl1417\\margr1134\\margt1134\\margb1134\\f0\\fs22\n' + enc(currentText()) + '\n}';
  }

  function pdfName() {
    const letter = currentLetter();
    return (letter ? letter.id : 'brief') + '-' + FE.today() + '.pdf';
  }

  /* ---------- signature (draw or photo, see js/signature.js) ---------- */
  function mountSignature() {
    const root = document.getElementById('sig-root');
    if (!root || !FE.signatureUI) return;
    FE.signatureUI.mount(root, {
      t: t,
      get: () => state.signature,
      set: (sig) => { state.signature = sig; persist(); },
      closing: J().closing || '',
      name: state.person.name || ''
    });
  }

  views.sources = function () {
    const j = J();
    const groups = ['law', 'rights', 'case', 'guideline', 'study', 'media'];
    let html = '<h1>' + esc(t('src.title')) + '</h1>' + why('sources') + '<p class="lead">' + esc(t('src.lead')) + '</p><p class="muted">' + esc(t('src.reviewed', { date: j.lastReviewed })) + '</p>';
    groups.forEach((g) => {
      const items = Object.values(j.sources).filter((s) => s.type === g);
      if (!items.length) return;
      html += '<section class="panel"><h2>' + esc(t('src.' + g)) + '</h2><ul class="sources">' + items.map((s) =>
        '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.short) + '</a><span>' + esc(s.title) + '</span></li>').join('') + '</ul></section>';
    });
    if (j.resources && j.resources.length) {
      html += '<section class="panel accent"><h2>' + esc(t('src.help')) + '</h2><ul class="sources">' + j.resources.map((r) =>
        '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.name) + '</a><span>' + esc(r.text) + '</span></li>').join('') + '</ul></section>';
    }
    return html;
  };

  views.lock = function () {
    return '<section class="lock"><div class="lock-icon" aria-hidden="true">🔒</div>' +
      '<h1>' + esc(t('lock.title')) + '</h1><p class="lead">' + esc(t('lock.lead')) + '</p>' +
      '<form class="panel" data-form="unlock"><div class="field"><label for="lock-pass">' + esc(t('lock.pass')) + '</label>' +
      '<input id="lock-pass" type="password" autocomplete="current-password" autofocus></div>' +
      '<p class="lock-error" id="lock-error" role="alert"></p>' +
      '<div class="actions"><button class="btn primary" type="submit">' + esc(t('lock.unlock')) + '</button></div></form>' +
      '<p><button class="btn ghost small" data-action="forgot">' + esc(t('lock.forgot')) + '</button></p>' + langField() + textSizeField() + '</section>';
  };

  function securityPanel() {
    if (!FE.crypto.available()) return '<section class="panel"><h2>' + esc(t('sec.title')) + '</h2><p class="muted">' + esc(t('sec.unavailable')) + '</p></section>';
    if (vault) {
      return '<section class="panel accent"><h2>🔒 ' + esc(t('sec.title')) + '</h2><p>' + esc(t('sec.on')) + '</p>' +
        '<div class="actions"><button class="btn primary" data-action="lockNow">' + esc(t('sec.lockNow')) + '</button>' +
        '<button class="btn" data-action="disableLock">' + esc(t('sec.disable')) + '</button></div>' +
        '<form data-form="changePass" class="grid"><div class="field"><label for="sec-p1">' + esc(t('sec.newPass')) + '</label><input id="sec-p1" type="password" autocomplete="new-password"></div>' +
        '<div class="field"><label for="sec-p2">' + esc(t('sec.pass2')) + '</label><input id="sec-p2" type="password" autocomplete="new-password"></div>' +
        '<div class="wide"><button class="btn small" type="submit">' + esc(t('sec.change')) + '</button></div></form></section>';
    }
    return '<section class="panel"><h2>' + esc(t('sec.title')) + '</h2><p>' + esc(t('sec.lead')) + '</p>' +
      '<form data-form="enableLock" class="grid"><div class="field"><label for="sec-p1">' + esc(t('sec.pass1')) + '</label><input id="sec-p1" type="password" autocomplete="new-password"></div>' +
      '<div class="field"><label for="sec-p2">' + esc(t('sec.pass2')) + '</label><input id="sec-p2" type="password" autocomplete="new-password"></div>' +
      '<p class="muted wide">' + esc(t('sec.warning')) + '</p>' +
      '<div class="wide"><button class="btn primary" type="submit">' + esc(t('sec.enable')) + '</button></div></form></section>';
  }

  views.data = function () {
    return '<h1>' + esc(t('data.title')) + '</h1>' + why('data') + '<p class="lead">' + esc(t('data.lead')) + '</p>' +
      securityPanel() +
      (vault ? '<p class="muted">' + esc(t('sec.exportNote')) + '</p>' : '') +
      '<section class="panel actions">' +
      '<button class="btn primary" data-action="export">' + esc(t('data.export')) + '</button>' +
      '<button class="btn" data-action="import">' + esc(t('data.import')) + '</button>' +
      '<input type="file" id="import-file" accept="application/json,.json" hidden>' +
      '</section><section class="panel danger"><button class="btn danger" data-action="wipe">' + esc(t('data.wipe')) + '</button></section>' +
      '<p><a href="privacy.html">' + esc(t('data.privacy')) + '</a></p>';
  };

  /* In-app text size, on top of the system setting (Android already follows the system
   * font size; iOS WebViews do not). CSS zoom scales text, spacing and touch targets
   * together, so layouts stay proportional and nothing overflows. */
  function applyTextSize() {
    const z = TEXT_SIZES.indexOf(String(state.settings.textSize)) >= 0 ? state.settings.textSize : '1';
    const root = document.documentElement;
    if ('zoom' in root.style) root.style.zoom = z === '1' ? '' : z;
    root.dataset.textsize = z;
  }

  function langField() {
    return field(t('ui.language'), 'settings.locale', { type: 'select',
      options: Object.keys(FE.locales).map((id) => ({ value: id, label: FE.locales[id]['lang.name'] || id })) });
  }

  function textSizeField() {
    return field(t('ui.textSize'), 'settings.textSize', { type: 'select',
      options: TEXT_SIZES.map((v) => ({ value: v, label: t('ui.textSize.' + v) })) });
  }

  /* Help: where the data lives and how to keep it. The web-only parts (hosting, browser
   * storage limits, installing) are hidden in the Android/iOS app. */
  views.help = function () {
    const web = !isNative();
    const sec = (title, body, cls) => '<section class="panel' + (cls ? ' ' + cls : '') + '"><h2>' + esc(title) + '</h2>' + body + '</section>';
    const p = (key) => '<p>' + esc(t(key)) + '</p>';
    const list = (keys, tag) => '<' + (tag || 'ul') + ' class="tips">' + keys.map((k) => '<li>' + esc(t(k)) + '</li>').join('') + '</' + (tag || 'ul') + '>';
    return '<h1>' + esc(t('help.title')) + '</h1><p class="lead">' + esc(t('help.lead')) + '</p>' +
      sec(t('help.where.title'), p(web ? 'help.where.web' : 'help.where.app'), 'accent') +
      (web ? sec(t('help.host.title'), p('help.host.text')) : '') +
      (web ? sec(t('help.loss.title'), list(['help.loss.clear', 'help.loss.private', 'help.loss.safari', 'help.loss.other']) +
        '<p><strong>' + esc(t('help.loss.tip')) + '</strong></p>' +
        '<div class="actions"><button class="btn primary" data-action="export">' + esc(t('backup.now')) + '</button></div>') : '') +
      sec(t('help.shared.title'), p('help.shared.text') +
        '<div class="actions"><button class="btn" data-action="go" data-view="data">' + esc(t('help.shared.button')) + '</button></div>') +
      sec(t('help.move.title'), list(['help.move.1', 'help.move.2', 'help.move.3'], 'ol')) +
      (web ? sec(t('help.install.title'), p('help.install.text') + list(['help.install.desktop', 'help.install.android', 'help.install.ios'])) : '') +
      sec(t('help.advice.title'), p('help.advice.text') +
        '<div class="actions"><button class="btn" data-action="go" data-view="sources">' + esc(t('nav.sources')) + '</button></div>') +
      '<p><a href="privacy.html">' + esc(t('data.privacy')) + '</a> · <a href="impressum.html">' + esc(t('nav.imprint')) + '</a>' +
      ((state.settings.hiddenWhy || []).length ? ' · <button class="btn ghost small" data-action="showWhy">' + esc(t('help.showWhy')) + '</button>' : '') + '</p>';
  };

  function hasContent(st) {
    return Object.keys(st.symptoms.checked).some((k) => st.symptoms.checked[k]) ||
      st.diary.length > 0 || st.encounters.length > 0 || st.decisions.length > 0 || !!st.person.name;
  }

  /* Offer a password once the user has entered something personal (name, address or a doctor visit),
   * on the pages where that happens. "No thanks" hides it for good; "My data" always has the option. */
  function lockOffer(v) {
    if (vault || locked || state.settings.lockOfferDismissed || !FE.crypto.available()) return '';
    if (['letter', 'history'].indexOf(v) < 0) return '';
    const p = state.person;
    if (!(p.name || p.street || p.zipCity || state.encounters.length)) return '';
    return '<aside class="panel accent lock-offer" role="status"><p><strong>' + esc(t('lockoffer.title')) + '</strong> ' + esc(t('lockoffer.text')) + '</p>' +
      '<div class="actions"><button class="btn primary small" data-action="go" data-view="data">' + esc(t('lockoffer.yes')) + '</button>' +
      '<button class="btn ghost small" data-action="lockOfferNo">' + esc(t('lockoffer.no')) + '</button></div></aside>';
  }

  /* Web version only: browser storage can be wiped (history cleared, private window,
   * Safari's 7-day limit), so nudge towards a backup file once there is something to lose. */
  function backupNag(v) {
    if (isNative() || locked || backupSnoozed || ['data', 'help'].indexOf(v) >= 0 || !hasContent(state)) return '';
    const last = state.settings.lastBackup;
    if (last && (Date.parse(FE.today()) - Date.parse(last)) / 86400000 < BACKUP_REMIND_DAYS) return '';
    return '<aside class="panel accent backup-nag" role="status"><p>' +
      esc(last ? t('backup.nagOld', { date: fmt(last) }) : t('backup.nag')) + '</p><div class="actions">' +
      '<button class="btn primary small" data-action="export">' + esc(t('backup.now')) + '</button>' +
      '<button class="btn ghost small" data-action="snoozeBackup">' + esc(t('backup.later')) + '</button></div></aside>';
  }

  views.more = function () {
    const item = (href, title, text) => '<a class="more-item" href="' + href + '"><strong>' + esc(title) + '</strong><span>' + esc(text) + '</span></a>';
    return '<h1>' + esc(t('nav.more')) + '</h1>' +
      '<section class="panel"><h2>' + esc(t('more.display')) + '</h2>' + langField() + textSizeField() + '<p class="muted">' + esc(t('ui.textSizeHint')) + '</p></section>' +
      '<nav class="more-list">' +
      item('#help', t('nav.help'), t('more.help')) +
      item('#sources', t('nav.sources'), t('more.sources')) +
      item('#data', t('nav.data'), t('more.data')) +
      item('privacy.html', t('data.privacy'), t('more.privacy')) +
      item('impressum.html', t('nav.imprint'), t('more.imprint')) +
      '</nav>';
  };

  /* ---------- rendering ---------- */
  function currentView() {
    const v = (location.hash || '').replace('#', '');
    return ALL_VIEWS.indexOf(v) >= 0 ? v : 'start';
  }

  function renderBottomNav(v) {
    const el = document.getElementById('bottomnav');
    if (!el) return;
    el.innerHTML = locked ? '' : BOTTOM.map(([id, covers]) =>
      '<a href="#' + id + '"' + (covers.indexOf(v) >= 0 ? ' aria-current="page"' : '') + '>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[id] + '</svg><span>' + esc(t('bnav.' + id)) + '</span></a>').join('');
  }

  function render() {
    const v = locked ? 'lock' : currentView();
    document.documentElement.lang = state.settings.locale;
    applyTextSize();
    document.body.classList.toggle('is-locked', locked);
    document.getElementById('nav').innerHTML = locked ? '' : VIEWS.map((id) =>
      '<a href="#' + id + '"' + (id === v ? ' aria-current="page"' : '') + '>' + esc(t('nav.' + id)) + '</a>').join('');
    document.getElementById('tagline').textContent = t('app.tagline');
    document.getElementById('footer').innerHTML = esc(t('footer')) + '<br><a href="impressum.html">' + esc(t('footer.imprint')) + '</a> · <a href="privacy.html">' + esc(t('footer.privacy')) + '</a>';
    document.getElementById('lang').innerHTML = '<label class="sr" for="lang-select">' + esc(t('ui.language')) + '</label>' +
      '<select id="lang-select" data-bind="settings.locale">' + Object.keys(FE.locales).map((id) =>
        '<option value="' + esc(id) + '"' + (id === state.settings.locale ? ' selected' : '') + '>' + esc(FE.locales[id]['lang.name'] || id) + '</option>').join('') + '</select>';
    renderBottomNav(v);
    const help = document.getElementById('helplink');
    if (help) {
      help.hidden = locked;
      help.setAttribute('aria-label', t('nav.help'));
      if (v === 'help') help.setAttribute('aria-current', 'page'); else help.removeAttribute('aria-current');
      help.innerHTML = '<span aria-hidden="true">?</span><span class="helplink-text">' + esc(t('nav.help')) + '</span>';
    }
    const offer = lockOffer(v);
    document.getElementById('view').innerHTML = (offer || backupNag(v)) + views[v]();
    if (v === 'letter') mountSignature();
    if (v === 'lock') { const p = document.getElementById('lock-pass'); if (p) p.focus(); }
  }

  /* ---------- lock / encryption forms ---------- */
  async function onSubmit(e) {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    const kind = form.getAttribute('data-form');
    const btn = form.querySelector('button[type=submit]');
    const busy = (on) => { if (btn) { btn.disabled = on; btn.textContent = on ? t('lock.working') : btn.dataset.label || btn.textContent; } };
    if (btn && !btn.dataset.label) btn.dataset.label = btn.textContent;

    if (kind === 'unlock') {
      const pass = document.getElementById('lock-pass').value;
      busy(true);
      try {
        const res = await FE.crypto.decrypt(pass, FE.loadEncrypted());
        state = FE.merge(FE.emptyState(), res.state);
        vault = { key: res.key, salt: res.salt };
        locked = false;
        lastActivity = Date.now();
        render();
        document.dispatchEvent(new CustomEvent('fightendo:unlock', { detail: { ok: true } }));
      } catch (err) {
        busy(false);
        document.getElementById('lock-error').textContent = t('lock.wrong');
        document.getElementById('lock-pass').select();
        document.dispatchEvent(new CustomEvent('fightendo:unlock', { detail: { ok: false } }));
      }
      return;
    }

    const p1 = document.getElementById('sec-p1').value;
    const p2 = document.getElementById('sec-p2').value;
    if (p1.length < 8) { toast(t('sec.short')); return; }
    if (p1 !== p2) { toast(t('sec.mismatch')); return; }
    busy(true);
    const salt = FE.crypto.newSalt();
    const key = await FE.crypto.deriveKey(p1, salt);
    vault = { key: key, salt: salt };
    await flushEncrypted();               // writes ciphertext, removes the plaintext copy
    toast(t(kind === 'enableLock' ? 'sec.enabled' : 'sec.changed'));
    render();
  }

  function refreshDerived() {
    document.querySelectorAll('[data-derived]').forEach((el) => {
      const kind = el.getAttribute('data-derived');
      if (kind === 'symptomSummary') el.innerHTML = symptomSummary();
      else if (kind === 'diaryStats') el.innerHTML = diaryStatsText();
      else if (kind === 'letterStatus') el.innerHTML = letterStatus(currentLetter());
      else if (kind === 'letterHead') el.innerHTML = letterHeadHtml(currentLetter());
      else if (kind === 'deadline') {
        const d = state.decisions.find((x) => x.id === el.getAttribute('data-id'));
        el.innerHTML = d ? deadlineText(d) : '';
      }
    });
  }

  /* ---------- events ---------- */
  function onInput(e) {
    const el = e.target;
    const path = el.getAttribute && el.getAttribute('data-bind');
    if (!path) return;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    FE.setPath(state, path, value);
    if (path === 'letter.type' || path.indexOf('settings.') === 0) { persist(); render(); return; }
    if (path.indexOf('letter.texts.') !== 0) refreshLetter();  // options, fields, notes, name … flow into the letter
    persist();
    refreshDerived();
  }

  const actions = {
    go(el) { location.hash = el.getAttribute('data-view'); },
    add(el) {
      const list = el.getAttribute('data-list');
      const item = { id: FE.uid() };
      if (list === 'diary') Object.assign(item, { date: FE.today(), pain: '', bleeding: '', missed: false, notes: '' });
      if (list === 'encounters') Object.assign(item, { date: FE.today(), who: '', specialty: '', said: '', refused: '', verbatim: false, witness: '' });
      if (list === 'decisions') Object.assign(item, { date: FE.today(), ref: '', what: '', reason: '', status: 'open' });
      state[list].push(item);
      persist(); render();
      const btn = document.querySelector('[data-action="remove"][data-id="' + item.id + '"]');
      const row = btn && btn.closest('.row');
      if (row) {
        row.scrollIntoView({ block: 'center', behavior: 'smooth' });
        const focusable = row.querySelector('input:not([type=date]), textarea');
        if (focusable) focusable.focus({ preventScroll: true });
      }
    },
    remove(el) {
      const list = el.getAttribute('data-list');
      const id = el.getAttribute('data-id');
      state[list] = state[list].filter((x) => x.id !== id);
      persist(); render();
    },
    generate() {
      const letter = currentLetter();
      if (!letter) { toast(t('letter.missing')); return; }
      if (isEdited(letter) && !confirm(t('letter.regenerateWarn'))) return;
      generateLetter(letter);
      persist(); render();
      const ta = document.querySelector('[data-bind="letter.texts.' + letter.id + '"]');
      if (ta) ta.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    print() {
      const area = document.getElementById('print-area');
      area.textContent = currentText();
      window.print();
    },
    copy() {
      const text = currentText();
      const done = () => toast(t('letter.copied'));
      const fallbackCopy = () => {
        const ta = document.querySelector('.letter-out textarea');
        if (ta) { ta.select(); document.execCommand('copy'); done(); }
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallbackCopy);
      else fallbackCopy();
    },
    download() {
      const letter = currentLetter();
      saveFile((letter ? letter.id : 'brief') + '-' + FE.today() + '.txt', currentText(), 'text/plain;charset=utf-8');
    },
    pdf() {
      try { saveFile(pdfName(), buildPdf(), 'application/pdf'); }
      catch (e) { console.error(e); toast(t('letter.pdfFail')); }
    },
    share() {
      try {
        if (isNative()) { FE.native.shareFile(pdfName(), buildPdf(), currentLetter() ? currentLetter().title : 'FightEndo').catch(() => { /* cancelled */ }); return; }
        const file = new File([buildPdf()], pdfName(), { type: 'application/pdf' });
        navigator.share({ files: [file], title: currentLetter() ? currentLetter().title : 'FightEndo' }).catch(() => { /* user cancelled */ });
      } catch (e) { console.error(e); toast(t('letter.pdfFail')); }
    },
    rtf() {
      const letter = currentLetter();
      saveFile((letter ? letter.id : 'brief') + '-' + FE.today() + '.rtf', buildRtf(), 'application/rtf');
    },
    sigClear() {
      const r = document.getElementById('sig-root');
      if (r && r._fightendoClear) r._fightendoClear();
    },
    async export() {
      // With the app lock on, backups are encrypted with the same passphrase.
      const body = vault ? await FE.crypto.encrypt(vault.key, vault.salt, state) : state;
      const ok = await saveFile('fightendo-' + (vault ? 'verschluesselt-' : 'sicherung-') + FE.today() + '.json', JSON.stringify(body, null, 2), 'application/json');
      if (ok) { state.settings.lastBackup = FE.today(); persist(); render(); }
    },
    snoozeBackup() { backupSnoozed = true; render(); },
    hideWhy(el) {
      const list = state.settings.hiddenWhy || (state.settings.hiddenWhy = []);
      const v = el.getAttribute('data-view');
      if (list.indexOf(v) < 0) list.push(v);
      persist();
      const box = el.closest('.why');
      if (box) box.remove();
    },
    showWhy() { state.settings.hiddenWhy = []; persist(); toast(t('help.showWhy')); render(); },
    lockOfferNo() { state.settings.lockOfferDismissed = true; persist(); render(); },
    tip(el) {
      const p = document.getElementById(el.getAttribute('aria-controls'));
      if (!p) return;
      p.hidden = !p.hidden;
      el.setAttribute('aria-expanded', String(!p.hidden));
    },
    lockNow() { lockNow(); },
    async disableLock() {
      if (!confirm(t('sec.disableConfirm'))) return;
      vault = null;
      FE.removeEncrypted();
      persist();
      toast(t('sec.disabled'));
      render();
    },
    forgot() {
      if (!confirm(t('lock.forgotConfirm'))) return;
      FE.wipe();
      const locale = state.settings.locale;
      state = FE.emptyState();
      state.settings.locale = locale;
      vault = null; locked = false;
      render(); toast(t('data.wiped'));
    },
    import() {
      const input = document.getElementById('import-file');
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            let data = JSON.parse(reader.result);
            if (data && data.fightendo === 'encrypted') {
              const pass = prompt(t('data.importPass'));
              if (!pass) return;
              data = (await FE.crypto.decrypt(pass, data)).state;
            }
            if (!data || typeof data !== 'object' || !data.symptoms) throw new Error('not a FightEndo backup');
            state = FE.merge(FE.emptyState(), data);
            persist(); render(); toast(t('data.importOk'));
          } catch (err) { toast(t('data.importFail')); }
        };
        reader.readAsText(file);
      };
      input.click();
    },
    wipe() {
      if (!confirm(t('data.wipeConfirm'))) return;
      FE.wipe();
      vault = null;
      state = FE.emptyState();
      render(); toast(t('data.wiped'));
    }
  };

  function onClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    e.preventDefault();
    const fn = actions[el.getAttribute('data-action')];
    if (fn) fn(el);
  }

  function isNative() { return !!(FE.native && FE.native.isNative()); }

  /* Saving – no cloud APIs, no accounts, no network. The user picks the place:
   *  - Android/iOS app: system share sheet → Files, Google Drive, Dropbox, OneDrive, e-mail …
   *  - Chrome/Edge desktop: "Save as" dialog → any folder, incl. synced Dropbox/Drive folders
   *  - other browsers: normal download. */
  async function saveFile(name, content, type) {
    if (isNative()) { FE.native.shareFile(name, content, name).catch((e) => console.warn(e)); return true; }
    if (window.showSaveFilePicker) {
      const ext = name.slice(name.lastIndexOf('.'));
      try {
        const handle = await window.showSaveFilePicker({ suggestedName: name, types: [{ description: ext.slice(1).toUpperCase(), accept: { [type.split(';')[0]]: [ext] } }] });
        const w = await handle.createWritable();
        await w.write(new Blob([content], { type: type }));
        await w.close();
        toast(t('letter.saved'));
        return true;
      } catch (e) {
        if (e && e.name === 'AbortError') return false; // user cancelled
        /* fall back to a normal download */
      }
    }
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }

  let toastTimer;
  function toast(msg, ms) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms || 2500);
  }

  /* ---------- boot ---------- */
  document.addEventListener('input', onInput);
  document.addEventListener('change', onInput);
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('focusin', (e) => { if (e.target.matches('input:not([type=checkbox]):not([type=range]), textarea, select')) document.body.classList.add('typing'); });
  document.addEventListener('focusout', () => document.body.classList.remove('typing'));
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  render();

  // Offline cache when served over http(s). Opening index.html directly works too.
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !isNative()) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline cache is optional */ });
  }
})();
