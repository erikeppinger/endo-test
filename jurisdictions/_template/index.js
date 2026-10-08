/* FightEndo – jurisdiction template
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Don't copy this by hand – run:   npm run new -- country <iso-code> "<Name>" <language>
 * Then fill it in and run:          npm run check   and   npm test
 * jurisdictions/de/index.js is a complete worked example (5 letters, ~40 sources).
 *
 * Rules (see CONTRIBUTING.md):
 *  - Every legal claim needs a source with a link to an official text.
 *  - Only cite studies you have read, with DOI.
 *  - Letter text is written in the language of the country (`language`).
 *  - No network calls. No tracking. No external scripts. */
(function () {
  'use strict';

  const CLOSING = 'Yours sincerely';   // exact closing line – the PDF signature is placed after it

  const sources = {
    // key: { type: 'law' | 'rights' | 'case' | 'guideline' | 'study' | 'media',
    //        short: 'citation as it appears in letters', title: 'one line', url: 'https://…' }
    eshre: { type: 'guideline', short: 'ESHRE guideline: endometriosis (2022)', title: 'Becker CM et al. Hum Reprod Open 2022;2022(2):hoac009', url: 'https://doi.org/10.1093/hropen/hoac009' },
    nice: { type: 'guideline', short: 'NICE NG73', title: 'Endometriosis: diagnosis and management', url: 'https://www.nice.org.uk/guidance/ng73' }
  };

  const resources = [
    // { name: 'Patient organisation', url: 'https://…', text: 'What they help with.' }
  ];

  // Shown under the letter: how to send it so it counts legally (post, fax, portal, e-mail?).
  const sendingTips = [
    // 'Appeals must be in writing – send by registered mail and keep a copy.'
  ];

  function symptoms(ctx) {
    return ctx.symptomLabels.length
      ? 'My symptoms:\n' + ctx.symptomLabels.map((l) => '  – ' + l).join('\n')
      : 'I have severe cyclical pelvic symptoms.';
  }

  const letters = [
    {
      id: 'insurer-request',
      title: 'Request to the health insurer',
      description: 'What this letter achieves, in one or two sentences.',
      fields: [
        // { id: 'decision', label: 'Decision', type: 'decision' }   // lets the user pick a recorded decision
        // { id: 'claim', label: '…', type: 'text' | 'textarea' | 'date', placeholder: '…' }
      ],
      options: [
        { id: 'guideline', label: 'Cite medical guidelines', default: true }
        // default can also be a function: (ctx) => ctx.encounters.length > 0
      ],
      /* ctx:
       *   p            person: name, street, zipCity, birthdate, insuranceNumber, insurer, insurerStreet, insurerZipCity
       *   s            raw symptom answers (see js/core.js emptyState), s.notes = user's notes
       *   symptomLabels checked symptoms as text in this country's language
       *   stats        diary statistics or null
       *   encounters   doctor visits · decisions: insurer decisions
       *   opt, f       chosen options and field values
       *   extra        the user's own addition – put it right before the closing
       *   cite(id)     short citation of a source · fmt(iso) date in local format · today: ISO date */
      // Return a DIN-style letter object (the app lays it out like a proper business
      // letter for window envelopes) – or a plain string for documents without addresses.
      build(ctx) {
        const body = ['Dear Sir or Madam,', symptoms(ctx)];
        if (ctx.s.notes) body.push(ctx.s.notes);
        if (ctx.opt.guideline) body.push('These symptoms are listed as reasons to investigate endometriosis (' + ctx.cite('nice') + '; ' + ctx.cite('eshre') + ').');
        if (ctx.extra) body.push(ctx.extra.trim());
        body.push(CLOSING + '\n\n\n' + (ctx.p.name || '[Signature]'));
        return {
          sender: [ctx.p.name || '[Name]', ctx.p.street || '[Street]', ctx.p.zipCity || '[Postcode City]'],
          recipient: [ctx.p.insurer || '[Insurer]', ctx.p.insurerStreet || '[Street]', ctx.p.insurerZipCity || '[Postcode City]'],
          info: [['Insurance no.', ctx.p.insuranceNumber || '[number]'], ['Date', ctx.fmt(ctx.today)]],
          subject: 'Request for a guideline-based endometriosis assessment',
          body: body.join('\n\n')
        };
      }
    }
  ];

  FightEndo.registerJurisdiction({
    id: 'xx',                         // ISO 3166 code = folder name
    name: 'Country (health system)',
    language: 'en',                   // needs i18n/<language>.js – used for symptom names in letters
    lastReviewed: 'YYYY-MM',
    closing: CLOSING,
    pageLabel: 'Page {i} of {n}',
    referencesHeading: 'Sources',         // heading of the source list appended to every letter
    sendingTips,
    dateFormat: (iso) => iso.split('-').reverse().join('/'),
    objectionDeadline: null,          // optional: (isoDate, FightEndo) => Date
    sources,
    resources,
    letters
    // Optional: an example letter with a fictional person, shown from the start page
    // ("See an example letter"). See jurisdictions/de/index.js for a full example.
    // example: { letter: '<letter id>', state: { person: {…}, symptoms: {…}, diary: [], encounters: [], decisions: [] } }
  });
})();
