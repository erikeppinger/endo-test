/* FightEndo – Rechtsordnung Deutschland (GKV)
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Gepflegt von der Community. Jede Änderung an Rechtsgrundlagen bitte mit Quelle
 * (Link auf gesetze-im-internet.de, Urteil mit Aktenzeichen) im Pull Request belegen.
 * Keine Rechtsberatung. */
(function () {
  'use strict';

  const GII = 'https://www.gesetze-im-internet.de/';
  const CLOSING = 'Mit freundlichen Grüßen';

  /* ------------------------------------------------------------------ */
  /* Quellen                                                            */
  /* type: law | rights | case | guideline | study | media              */
  /* ------------------------------------------------------------------ */
  const sources = {
    // --- Sozialrecht / GKV ---
    sgb5_27: { type: 'law', short: '§ 27 Abs. 1 SGB V', title: 'Anspruch auf Krankenbehandlung (Krankheit erkennen, heilen, Verschlimmerung verhüten, Beschwerden lindern)', url: GII + 'sgb_5/__27.html' },
    sgb5_2: { type: 'law', short: '§ 2 Abs. 1 S. 3 SGB V', title: 'Leistungen müssen dem allgemein anerkannten Stand der medizinischen Erkenntnisse entsprechen', url: GII + 'sgb_5/__2.html' },
    sgb5_2a: { type: 'law', short: '§ 2a SGB V', title: 'Besondere Belange chronisch kranker Menschen', url: GII + 'sgb_5/__2a.html' },
    sgb5_2b: { type: 'law', short: '§ 2b SGB V', title: 'Geschlechtsspezifischen Besonderheiten ist Rechnung zu tragen', url: GII + 'sgb_5/__2b.html' },
    sgb5_12: { type: 'law', short: '§ 12 Abs. 1 SGB V', title: 'Wirtschaftlichkeitsgebot: ausreichend, zweckmäßig, wirtschaftlich', url: GII + 'sgb_5/__12.html' },
    sgb5_11: { type: 'law', short: '§ 11 Abs. 4 SGB V', title: 'Anspruch auf Versorgungsmanagement', url: GII + 'sgb_5/__11.html' },
    sgb5_13_3: { type: 'law', short: '§ 13 Abs. 3 SGB V', title: 'Kostenerstattung bei nicht rechtzeitig erbrachter oder zu Unrecht abgelehnter Leistung', url: GII + 'sgb_5/__13.html' },
    sgb5_13_3a: { type: 'law', short: '§ 13 Abs. 3a SGB V', title: 'Entscheidungsfristen der Krankenkasse (3 bzw. 5 Wochen)', url: GII + 'sgb_5/__13.html' },
    sgb5_75: { type: 'law', short: '§ 75 Abs. 1a SGB V', title: 'Terminservicestellen: Facharzttermin innerhalb von vier Wochen', url: GII + 'sgb_5/__75.html' },
    sgb1_14: { type: 'law', short: '§ 14 SGB I', title: 'Anspruch auf Beratung durch den Leistungsträger', url: GII + 'sgb_1/__14.html' },
    sgb1_17: { type: 'law', short: '§ 17 Abs. 1 Nr. 1 SGB I', title: 'Sozialleistungen sind umfassend und zügig zu erbringen', url: GII + 'sgb_1/__17.html' },
    sgb5_31: { type: 'law', short: '§ 31 Abs. 1 SGB V', title: 'Anspruch auf Versorgung mit Arzneimitteln', url: GII + 'sgb_5/__31.html' },
    sgb5_24a: { type: 'law', short: '§ 24a SGB V', title: 'Empfängnisverhütung (Altersgrenze gilt nur für Verhütungsmittel, nicht für Therapie)', url: GII + 'sgb_5/__24a.html' },
    sgb5_40: { type: 'law', short: '§ 40 SGB V', title: 'Leistungen zur medizinischen Rehabilitation', url: GII + 'sgb_5/__40.html' },
    sgb6_15: { type: 'law', short: '§ 15 SGB VI', title: 'Medizinische Rehabilitation durch die Rentenversicherung', url: GII + 'sgb_6/__15.html' },
    sgb9_14: { type: 'law', short: '§ 14 SGB IX', title: 'Zuständigkeitsklärung: Weiterleitung an den zuständigen Rehabilitationsträger', url: GII + 'sgb_9_2018/__14.html' },
    sgb10_25: { type: 'law', short: '§ 25 SGB X', title: 'Akteneinsicht im Verwaltungsverfahren', url: GII + 'sgb_10/__25.html' },
    sgb10_35: { type: 'law', short: '§ 35 SGB X', title: 'Begründungspflicht für Bescheide', url: GII + 'sgb_10/__35.html' },
    sgb10_37: { type: 'law', short: '§ 37 Abs. 2 SGB X', title: 'Bekanntgabe per Post gilt am vierten Tag nach Aufgabe als erfolgt (seit 2025)', url: GII + 'sgb_10/__37.html' },
    sgb10_44: { type: 'law', short: '§ 44 SGB X', title: 'Überprüfungsantrag gegen bestandskräftige, rechtswidrige Bescheide', url: GII + 'sgb_10/__44.html' },
    sgg_84: { type: 'law', short: '§ 84 Abs. 1 SGG', title: 'Widerspruch binnen eines Monats nach Bekanntgabe', url: GII + 'sgg/__84.html' },
    sgg_66: { type: 'law', short: '§ 66 SGG', title: 'Ohne korrekte Rechtsbehelfsbelehrung: ein Jahr Frist', url: GII + 'sgg/__66.html' },
    sgg_183: { type: 'law', short: '§ 183 SGG', title: 'Verfahren vor dem Sozialgericht sind für Versicherte gerichtskostenfrei', url: GII + 'sgg/__183.html' },
    // --- Patientenrechte ---
    bgb_630c: { type: 'law', short: '§ 630c Abs. 2 BGB', title: 'Informationspflicht der Behandelnden', url: GII + 'bgb/__630c.html' },
    bgb_630f: { type: 'law', short: '§ 630f BGB', title: 'Dokumentationspflicht der Behandelnden', url: GII + 'bgb/__630f.html' },
    bgb_630g: { type: 'law', short: '§ 630g BGB', title: 'Recht auf Einsicht in die Patientenakte und Abschriften', url: GII + 'bgb/__630g.html' },
    dsgvo_15: { type: 'law', short: 'Art. 15 DSGVO', title: 'Auskunftsrecht, erste Kopie unentgeltlich (Abs. 3)', url: 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679' },
    dsgvo_12: { type: 'law', short: 'Art. 12 Abs. 3 DSGVO', title: 'Antwort innerhalb eines Monats', url: 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679' },
    // --- Grund- und Menschenrechte ---
    gg_2_2: { type: 'rights', short: 'Art. 2 Abs. 2 S. 1 GG', title: 'Recht auf Leben und körperliche Unversehrtheit', url: GII + 'gg/art_2.html' },
    gg_3_2: { type: 'rights', short: 'Art. 3 Abs. 2 GG', title: 'Gleichberechtigung; Staat wirkt auf Beseitigung bestehender Nachteile hin', url: GII + 'gg/art_3.html' },
    gg_3_3: { type: 'rights', short: 'Art. 3 Abs. 3 S. 1 GG', title: 'Niemand darf wegen des Geschlechts benachteiligt werden', url: GII + 'gg/art_3.html' },
    grch_35: { type: 'rights', short: 'Art. 35 GRCh', title: 'EU-Grundrechtecharta: Gesundheitsschutz', url: 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:12012P/TXT' },
    grch_23: { type: 'rights', short: 'Art. 23 GRCh', title: 'EU-Grundrechtecharta: Gleichheit von Frauen und Männern', url: 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:12012P/TXT' },
    cedaw_12: { type: 'rights', short: 'Art. 12 CEDAW', title: 'UN-Frauenrechtskonvention: Beseitigung der Diskriminierung von Frauen im Gesundheitswesen', url: 'https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-elimination-all-forms-discrimination-against-women' },
    icescr_12: { type: 'rights', short: 'Art. 12 UN-Sozialpakt', title: 'Recht auf das erreichbare Höchstmaß an körperlicher und geistiger Gesundheit', url: 'https://www.ohchr.org/en/instruments-mechanisms/instruments/international-covenant-economic-social-and-cultural-rights' },
    // --- Rechtsprechung ---
    bverfg_2005: { type: 'case', short: 'BVerfG, Beschl. v. 6.12.2005 – 1 BvR 347/98', title: 'Leistungsrecht der GKV ist an Art. 2 Abs. 1 GG i. V. m. Sozialstaatsprinzip und Art. 2 Abs. 2 GG zu messen (Anlass: lebensbedrohliche Erkrankung)', url: 'https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2005/12/rs20051206_1bvr034798.html' },
    eugh_c307: { type: 'case', short: 'EuGH, Urt. v. 26.10.2023 – C-307/22', title: 'Erste Kopie der Patientenakte ist unentgeltlich, ohne Begründung', url: 'https://curia.europa.eu/juris/liste.jsf?num=C-307/22' },
    bsg_offlabel: { type: 'case', short: 'BSG, Urt. v. 19.3.2002 – B 1 KR 37/00 R', title: 'Off-Label-Use zulasten der GKV: schwerwiegende Erkrankung, keine Alternative, begründete Erfolgsaussicht', url: 'https://dejure.org/dienste/vernetzung/rechtsprechung?Gericht=BSG&Datum=19.03.2002&Aktenzeichen=B%201%20KR%2037%2F00%20R' },
    bsg_2020: { type: 'case', short: 'BSG, Urt. v. 26.5.2020 – B 1 KR 9/18 R', title: 'Genehmigungsfiktion (§ 13 Abs. 3a SGB V) begründet nur Kostenerstattung, keinen Sachleistungsanspruch', url: 'https://dejure.org/dienste/vernetzung/rechtsprechung?Gericht=BSG&Datum=26.05.2020&Aktenzeichen=B%201%20KR%209%2F18%20R' },
    // --- Leitlinien ---
    awmf: { type: 'guideline', short: 'AWMF S2k-Leitlinie Endometriose (Reg.-Nr. 015-045)', title: 'Diagnostik und Therapie der Endometriose – DGGG, SGGG, OEGGG', url: 'https://register.awmf.org/de/leitlinien/detail/015-045' },
    eshre: { type: 'guideline', short: 'ESHRE-Leitlinie Endometriose 2022', title: 'Becker CM et al. ESHRE guideline: endometriosis. Hum Reprod Open 2022;2022(2):hoac009', url: 'https://doi.org/10.1093/hropen/hoac009' },
    nice: { type: 'guideline', short: 'NICE NG73', title: 'Endometriosis: diagnosis and management (UK National Institute for Health and Care Excellence)', url: 'https://www.nice.org.uk/guidance/ng73' },
    who: { type: 'guideline', short: 'WHO-Faktenblatt Endometriose', title: 'Rund 10 % der Frauen und Mädchen im reproduktiven Alter sind betroffen', url: 'https://www.who.int/news-room/fact-sheets/detail/endometriosis' },
    // --- Studien ---
    zondervan: { type: 'study', short: 'Zondervan et al., NEJM 2020', title: 'Zondervan KT, Becker CM, Missmer SA. Endometriosis. N Engl J Med 2020;382:1244–1256', url: 'https://doi.org/10.1056/NEJMra1810764' },
    hudelist: { type: 'study', short: 'Hudelist et al., Hum Reprod 2012', title: 'Diagnostic delay for endometriosis in Austria and Germany: causes and possible consequences. Hum Reprod 2012;27(12):3412–3416', url: 'https://doi.org/10.1093/humrep/des316' },
    nnoaham: { type: 'study', short: 'Nnoaham et al., Fertil Steril 2011', title: 'Impact of endometriosis on quality of life and work productivity: a multicenter study across ten countries. Fertil Steril 2011;96(2):366–373', url: 'https://doi.org/10.1016/j.fertnstert.2011.05.090' },
    ballard: { type: 'study', short: 'Ballard et al., Fertil Steril 2006', title: 'What’s the delay? A qualitative study of women’s experiences of reaching a diagnosis of endometriosis. Fertil Steril 2006;86(5):1296–1301', url: 'https://doi.org/10.1016/j.fertnstert.2006.04.057' },
    hoffmann: { type: 'study', short: 'Hoffmann & Tarzian, J Law Med Ethics 2001', title: 'The girl who cried pain: a bias against women in the treatment of pain. J Law Med Ethics 2001;29(1):13–27', url: 'https://doi.org/10.1111/j.1748-720X.2001.tb00037.x' },
    samulowitz: { type: 'study', short: 'Samulowitz et al., Pain Res Manag 2018', title: '“Brave men” and “emotional women”: gender bias in health care and gendered norms towards patients with chronic pain. Pain Res Manag 2018:6358624', url: 'https://doi.org/10.1155/2018/6358624' },
    // --- Berichte ---
    taz: { type: 'media', short: 'taz: Höllische Menstruationsschmerzen', title: 'Erfahrungsbericht über jahrelang abgetane Endometriose-Beschwerden', url: 'https://taz.de/Hoellische-Menstruationsschmerzen/!6208401/' }
  };

  const resources = [
    { name: 'Endometriose-Vereinigung Deutschland e. V.', url: 'https://www.endometriose-vereinigung.de', text: 'Selbsthilfe, Beratung, Liste von Endometriosezentren.' },
    { name: 'Stiftung Endometriose-Forschung (SEF)', url: 'https://www.endometriose-sef.de', text: 'Zertifizierte Endometriosezentren (gemeinsam mit EEL/EuroEndoCert).' },
    { name: 'Terminservice 116117', url: 'https://www.116117.de', text: 'Facharzttermin über die Terminservicestelle (Tel. 116117), mit Dringlichkeitscode auf der Überweisung.' },
    { name: 'Unabhängige Patientenberatung (UPD)', url: 'https://www.patientenberatung.de', text: 'Kostenlose, unabhängige Beratung zu Patientenrechten.' },
    { name: 'Sozialverband VdK / SoVD', url: 'https://www.vdk.de', text: 'Hilfe bei Widerspruch und Klage gegen die Krankenkasse (Mitgliedschaft).' },
    { name: 'Bundesamt für Soziale Sicherung', url: 'https://www.bundesamtsozialesicherung.de', text: 'Aufsichtsbeschwerde über bundesweit geöffnete Krankenkassen (regionale Kassen, z. B. AOK: Landesaufsicht).' },
    { name: 'Sozialgericht', url: GII + 'sgg/__183.html', text: 'Klage nach abgelehntem Widerspruch ist für Versicherte gerichtskostenfrei (§ 183 SGG).' }
  ];

  /* ------------------------------------------------------------------ */
  /* Textbausteine                                                      */
  /* ------------------------------------------------------------------ */
  /* Briefkopf nach DIN 5008: Absender, Anschrift (Fensterumschlag), Informationsblock. */
  function sender(c) {
    const p = c.p;
    return [p.name || '[Vor- und Nachname]', p.street || '[Straße, Hausnummer]', p.zipCity || '[PLZ Ort]'];
  }

  function insurer(c) {
    const p = c.p;
    return [p.insurer || '[Name der Krankenkasse]', p.insurerStreet || '[Straße]', p.insurerZipCity || '[PLZ Ort]'];
  }

  function doctor(c) {
    return [c.f.doctor || '[Praxis / Ärzt*in]', c.f.doctorStreet || '[Straße]', c.f.doctorZipCity || '[PLZ Ort]'];
  }

  // Informationsblock (rechts neben der Anschrift). `extra` = zusätzliche [Bezeichnung, Wert]-Paare.
  function info(c, opts) {
    opts = opts || {};
    const rows = [];
    if (opts.ref) rows.push(['Ihr Zeichen', opts.ref]);
    if (opts.insured !== false) rows.push(['Versichertennr.', c.p.insuranceNumber || '[Versichertennummer]']);
    if (c.p.birthdate) rows.push(['Geburtsdatum', c.fmt(c.p.birthdate)]);
    rows.push(['Datum', c.fmt(c.today)]);
    return rows;
  }

  function placeDate(c) {
    const city = (c.p.zipCity || '').replace(/^\d+\s*/, '');
    return (city || '[Ort]') + ', ' + c.fmt(c.today);
  }

  // A DIN 5008 letter: head fields + body (salutation … closing … enclosures).
  function letter(head, parts) {
    return Object.assign({ body: parts.join('\n\n') }, head);
  }

  function signature(c) {
    return CLOSING + '\n\n\n' + (c.p.name || '[Unterschrift]');
  }

  function therapySentence(kind, what, effect) {
    const tail = ({
      none: ': ohne ausreichende Wirkung.',
      partial: ': nur teilweise wirksam.',
      good: ': wirksam, die Beschwerden bestehen jedoch fort.',
      side: ': abgebrochen wegen Nebenwirkungen.',
      never: ': bisher nicht angeboten.'
    })[effect] || '.';
    return kind + ' (' + what + ')' + tail;
  }

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  function symptomParagraph(c) {
    const s = c.s;
    const out = [];
    const since = s.onsetYear ? ' seit ' + s.onsetYear : '';
    if (c.symptomLabels.length) {
      out.push('Ich leide' + since + ' unter folgenden Beschwerden:\n' + c.symptomLabels.map((l) => '  – ' + l).join('\n'));
    } else {
      out.push('Ich leide' + since + ' unter erheblichen, zyklisch auftretenden Unterleibsbeschwerden.');
    }
    if (s.diagnosis === 'diagnosed') out.push('Bei mir wurde ' + (s.diagnosisYear ? 'im Jahr ' + s.diagnosisYear + ' ' : '') + 'eine Endometriose diagnostiziert.');
    const extra = [];
    if (s.dysmenorrheaNrs !== '' && s.dysmenorrheaNrs != null) extra.push('Die Regelschmerzen erreichen auf der Schmerzskala (0–10) einen Wert von ' + s.dysmenorrheaNrs + '.');
    if (s.dailyImpact) extra.push('Die Schmerzen hindern mich regelmäßig an der Teilnahme an Arbeit bzw. Ausbildung und Alltag.');
    if (s.missedDays) extra.push('Ich falle deswegen ca. ' + plural(+s.missedDays, 'Tag', 'Tage') + ' pro Monat aus.');
    if (s.emergencyVisits) extra.push('Ich musste deswegen bereits ' + s.emergencyVisits + '-mal eine Notaufnahme aufsuchen.');
    if (s.painkillers) extra.push(therapySentence('Schmerzmittel', s.painkillers, s.painkillerEffect));
    if (s.hormones) extra.push(therapySentence('Hormonelle Behandlung', s.hormones, s.hormoneEffect));
    if (s.familyHistory) extra.push('In meiner direkten Familie ist Endometriose bekannt.');
    if (extra.length) out.push(extra.join(' '));
    if (s.notes && s.notes.trim()) out.push('Ergänzend möchte ich angeben: ' + s.notes.trim());
    if (c.stats) {
      const st = c.stats;
      let t = 'Ich führe ein Schmerztagebuch (' + plural(st.entries, 'Eintrag', 'Einträge') + ' vom ' + c.fmt(st.from) + ' bis ' + c.fmt(st.to) + ')';
      if (st.avgPain != null) t += ': durchschnittliche Schmerzstärke ' + String(st.avgPain).replace('.', ',') + ', Höchstwert ' + st.maxPain + ', ' + plural(st.severeDays, 'Tag', 'Tage') + ' mit Schmerzen ≥ 7';
      if (st.missedDays) t += ', ' + plural(st.missedDays, 'Ausfalltag', 'Ausfalltage');
      out.push(t + '.');
    }
    if (s.onsetYear) {
      const years = new Date().getFullYear() - Number(s.onsetYear);
      if (years >= 2 && s.diagnosis !== 'diagnosed') out.push('Damit bestehen die Beschwerden seit rund ' + years + ' Jahren, ohne dass eine gezielte Abklärung auf Endometriose erfolgt ist.');
      if (years >= 2 && s.diagnosis === 'diagnosed') out.push('Damit bestehen die Beschwerden seit rund ' + years + ' Jahren.');
    }
    return out.join('\n\n');
  }

  function historyParagraph(c) {
    if (!c.encounters.length) return '';
    const lines = c.encounters.map((e) => {
      let l = '  – ' + (e.date ? c.fmt(e.date) : '[Datum]') + ', ' + (e.who || '[Praxis]') + (e.specialty ? ' (' + e.specialty + ')' : '');
      if (e.said) l += ': ' + (e.verbatim ? '„' + e.said + '“' : e.said);
      if (e.refused) l += ' Abgelehnt/nicht durchgeführt: ' + e.refused + '.';
      return l;
    });
    return 'Bisheriger Behandlungsverlauf:\n' + lines.join('\n');
  }

  function guidelineParagraph(c) {
    return 'Nach dem allgemein anerkannten Stand der medizinischen Erkenntnisse sind diese Beschwerden ein ausdrücklicher Anlass, an Endometriose zu denken und gezielt abzuklären (' +
      c.cite('nice') + '; ' + c.cite('eshre') + '; ' + c.cite('awmf') + '). Die Leitlinien sehen hierfür insbesondere eine gynäkologische Untersuchung, eine spezialisierte transvaginale Sonographie, gegebenenfalls eine MRT sowie – wo angezeigt – eine Laparoskopie mit histologischer Sicherung vor. ' +
      'Endometriose betrifft rund jede zehnte Frau im reproduktiven Alter (' + c.cite('who') + '; ' + c.cite('zondervan') + '). Die bloße Einordnung als „normale Regelschmerzen“ entspricht diesem Standard nicht.';
  }

  function delayParagraph(c) {
    return 'Die Diagnose von Endometriose verzögert sich im deutschsprachigen Raum im Durchschnitt um viele Jahre; Studien zeigen, dass die Beschwerden dabei häufig normalisiert oder bagatellisiert werden (' +
      c.cite('hudelist') + '; ' + c.cite('ballard') + '). Die Erkrankung mindert Lebensqualität und Arbeitsfähigkeit erheblich (' + c.cite('nnoaham') + '). Eine frühzeitige, gezielte Diagnostik ist daher nicht nur medizinisch geboten, sondern auch im Sinne des Wirtschaftlichkeitsgebots (' + c.cite('sgb5_12') + ') sinnvoller als jahrelange ergebnislose Einzelbehandlungen.';
  }

  function biasParagraph(c) {
    return 'Mehrere der oben dokumentierten Äußerungen stellen keine medizinische Begründung dar. Die Forschung belegt eine systematische Unterschätzung von Schmerzen bei Frauen (' + c.cite('hoffmann') + '; ' + c.cite('samulowitz') + '). ' +
      'Nach ' + c.cite('sgb5_2b') + ' ist bei den Leistungen der Krankenkassen geschlechtsspezifischen Besonderheiten Rechnung zu tragen; nach ' + c.cite('sgb5_2a') + ' ist den besonderen Belangen chronisch kranker Menschen Rechnung zu tragen.';
  }

  function rightsParagraph(c) {
    return 'Ich weise darauf hin, dass die Leistungsgewährung der gesetzlichen Krankenversicherung an meinem Grundrecht auf körperliche Unversehrtheit (' + c.cite('gg_2_2') + ') und am Gleichberechtigungsgebot (' + c.cite('gg_3_2') + ', ' + c.cite('gg_3_3') + ') zu messen ist (vgl. ' + c.cite('bverfg_2005') + '). ' +
      'Auch die UN-Frauenrechtskonvention verpflichtet Deutschland, Diskriminierung von Frauen im Gesundheitswesen zu beseitigen (' + c.cite('cedaw_12') + '); der UN-Sozialpakt garantiert das erreichbare Höchstmaß an Gesundheit (' + c.cite('icescr_12') + ').';
  }

  /* Rechtliche Begründung im Widerspruch – je nach Art der abgelehnten Leistung. */
  function objectionBasis(c, kind, o) {
    const out = [];
    const standard = ' Qualität und Wirksamkeit der Leistungen haben dem allgemein anerkannten Stand der medizinischen Erkenntnisse zu entsprechen (' + c.cite('sgb5_2') + ').';
    if (kind === 'drug') {
      out.push('Ich habe Anspruch auf Krankenbehandlung, die notwendig ist, um Krankheitsbeschwerden zu lindern und eine Verschlimmerung zu verhüten (' + c.cite('sgb5_27') + '), einschließlich der Versorgung mit Arzneimitteln (' + c.cite('sgb5_31') + ').' + standard);
      out.push('Das Präparat dient nicht der Empfängnisverhütung, sondern der Behandlung meiner Endometriose-Beschwerden. Der Leistungsausschluss für Verhütungsmittel (' + c.cite('sgb5_24a') + ') ist daher nicht einschlägig. Hormonelle Therapien – darunter Gestagene und kombinierte hormonale Präparate – gehören nach der Leitlinie zu den empfohlenen Behandlungsoptionen bei Endometriose-Schmerzen (' + c.cite('eshre') + '; ' + c.cite('awmf') + ').');
      out.push('Soweit das Präparat für diese Indikation nicht zugelassen ist, liegen die Voraussetzungen für einen Off-Label-Use zulasten der gesetzlichen Krankenversicherung vor (' + c.cite('bsg_offlabel') + '): Es handelt sich um eine die Lebensqualität auf Dauer nachhaltig beeinträchtigende Erkrankung, die zugelassene Alternative kommt für mich ' +
        (c.s.hormoneEffect === 'side' ? 'wegen Nebenwirkungen ' : (c.s.hormoneEffect === 'none' ? 'mangels Wirksamkeit ' : '')) + 'nicht in Betracht, und nach dem Stand der Wissenschaft besteht eine begründete Aussicht auf einen Behandlungserfolg.');
    } else if (kind === 'rehab') {
      out.push('Ich habe Anspruch auf Leistungen zur medizinischen Rehabilitation, wenn ambulante Krankenbehandlung nicht ausreicht, um die Krankheitsfolgen zu mildern (' + c.cite('sgb5_40') + '). Soweit die gesetzliche Rentenversicherung zuständig ist, ergibt sich der Anspruch aus ' + c.cite('sgb6_15') + '. Sollten Sie sich für unzuständig halten, sind Sie verpflichtet, den Antrag an den zuständigen Träger weiterzuleiten (' + c.cite('sgb9_14') + ').');
      out.push('Die bisherigen ambulanten Maßnahmen haben nicht ausgereicht, um meine Beschwerden und deren Folgen für Alltag und Erwerbsfähigkeit ausreichend zu lindern. Den besonderen Belangen chronisch kranker Menschen ist dabei Rechnung zu tragen (' + c.cite('sgb5_2a') + ').');
    } else if (kind === 'treatment') {
      out.push('Ich habe Anspruch auf Krankenbehandlung, die notwendig ist, um eine Krankheit zu heilen, ihre Verschlimmerung zu verhüten oder Krankheitsbeschwerden zu lindern (' + c.cite('sgb5_27') + ').' + standard);
      if (o.guideline) out.push('Die Leitlinien empfehlen bei Endometriose eine individuell abgestimmte medikamentöse und/oder operative Therapie, bei komplexen Befunden in spezialisierten Zentren (' + c.cite('eshre') + '; ' + c.cite('awmf') + '; ' + c.cite('nice') + ').');
    } else {
      out.push('Ich habe Anspruch auf Krankenbehandlung, die notwendig ist, um eine Krankheit zu erkennen (' + c.cite('sgb5_27') + '), und zwar nach dem allgemein anerkannten Stand der medizinischen Erkenntnisse (' + c.cite('sgb5_2') + ').');
      if (o.guideline) out.push(guidelineParagraph(c));
    }
    if (o.delay && kind === 'diagnostics' && c.s.diagnosis !== 'diagnosed') out.push(delayParagraph(c));
    return out;
  }

  function attachmentList(c, extra) {
    const items = [];
    if (c.opt.attachDiary && c.stats) items.push('Schmerztagebuch (' + c.fmt(c.stats.from) + ' – ' + c.fmt(c.stats.to) + ')');
    if (c.opt.attachChronology && c.encounters.length) items.push('Chronologie des Behandlungsverlaufs');
    (extra || []).forEach((x) => items.push(x));
    if (!items.length) return '';
    return 'Anlagen:\n' + items.map((x) => '  – ' + x).join('\n');
  }

  function chronologyText(c) {
    const rows = [];
    c.encounters.forEach((e) => rows.push({ date: e.date, text: (e.who || 'Praxis') + (e.specialty ? ' (' + e.specialty + ')' : '') + (e.said ? '\n    Aussage: ' + (e.verbatim ? '„' + e.said + '“ (wörtlich)' : e.said) : '') + (e.refused ? '\n    Abgelehnt / nicht durchgeführt: ' + e.refused : '') + (e.witness ? '\n    Anwesend: ' + e.witness : '') }));
    c.decisions.forEach((d) => rows.push({ date: d.date, text: 'Bescheid ' + (c.p.insurer || 'Krankenkasse') + (d.ref ? ', Az. ' + d.ref : '') + (d.what ? '\n    Abgelehnt: ' + d.what : '') + (d.reason ? '\n    Begründung: ' + d.reason : '') }));
    rows.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    return rows.map((r) => (r.date ? c.fmt(r.date) : '[Datum]') + '\n    ' + r.text).join('\n\n');
  }

  /* ------------------------------------------------------------------ */
  /* Briefvorlagen                                                      */
  /* ------------------------------------------------------------------ */
  const letters = [
    {
      id: 'kk-antrag',
      title: 'Antrag an die Krankenkasse: Unterstützung bei Endometriose-Abklärung',
      description: 'Erzeugt eine schriftliche Spur: Die Kasse muss sich mit deinem Fall befassen, dich beraten, bei der Vermittlung an ein Endometriosezentrum helfen und schriftlich entscheiden.',
      options: [
        { id: 'guideline', label: 'Medizinischer Standard (Leitlinien NICE, ESHRE, AWMF)', default: true },
        { id: 'delay', label: 'Diagnoseverzögerung & Wirtschaftlichkeit (Studien)', default: true },
        { id: 'bias', label: 'Bagatellisierung / Gender-Bias bei Schmerz', default: (c) => c.encounters.some((e) => e.said) },
        { id: 'rights', label: 'Grund- und Menschenrechte', default: true },
        { id: 'center', label: 'Bitte um Vermittlung an ein zertifiziertes Endometriosezentrum', default: true },
        { id: 'appointment', label: 'Hinweis auf Terminservicestelle (§ 75 Abs. 1a SGB V)', default: true },
        { id: 'reimbursement', label: 'Hinweis auf Kostenerstattung (§ 13 Abs. 3 SGB V), falls keine rechtzeitige Versorgung', default: false },
        { id: 'deadline', label: 'Hinweis auf Entscheidungsfristen (§ 13 Abs. 3a SGB V)', default: true },
        { id: 'attachDiary', label: 'Schmerztagebuch als Anlage erwähnen', default: (c) => !!c.stats },
        { id: 'attachChronology', label: 'Chronologie als Anlage erwähnen', default: (c) => c.encounters.length > 0 }
      ],
      build(c) {
        const o = c.opt;
        const parts = [];
        parts.push('Sehr geehrte Damen und Herren,');
        parts.push('hiermit beantrage ich Ihre Unterstützung bei der leitliniengerechten Abklärung einer Endometriose. Ich bitte um eine schriftliche, rechtsmittelfähige Entscheidung.');
        parts.push('1. Sachverhalt');
        parts.push(symptomParagraph(c));
        const h = historyParagraph(c);
        if (h) parts.push(h);
        if (c.decisions.length) {
          parts.push('Bereits abgelehnte Leistungen:\n' + c.decisions.map((d) => '  – Bescheid vom ' + (d.date ? c.fmt(d.date) : '[Datum]') + (d.ref ? ' (Az. ' + d.ref + ')' : '') + ': ' + (d.what || '[Leistung]')).join('\n'));
        }
        parts.push('2. Medizinische und rechtliche Begründung');
        parts.push('Nach ' + c.cite('sgb5_27') + ' habe ich Anspruch auf Krankenbehandlung, wenn sie notwendig ist, um eine Krankheit zu erkennen, zu heilen, ihre Verschlimmerung zu verhüten oder Krankheitsbeschwerden zu lindern. Qualität und Wirksamkeit der Leistungen haben dem allgemein anerkannten Stand der medizinischen Erkenntnisse zu entsprechen (' + c.cite('sgb5_2') + ').');
        if (o.guideline) parts.push(guidelineParagraph(c));
        if (o.delay) parts.push(delayParagraph(c));
        if (o.bias && c.encounters.some((e) => e.said)) parts.push(biasParagraph(c));
        if (o.rights) parts.push(rightsParagraph(c));
        parts.push('3. Meine Anträge');
        const req = [];
        req.push('Bitte bestätigen Sie mir schriftlich, dass Sie die Kosten einer leitliniengerechten Endometriose-Diagnostik übernehmen (spezialisierte Sonographie, bei Bedarf MRT und – falls ärztlich indiziert – diagnostische Laparoskopie mit Histologie).');
        if (o.center) req.push('Bitte benennen Sie mir zertifizierte Endometriosezentren bzw. spezialisierte Einrichtungen in zumutbarer Entfernung und unterstützen Sie mich im Rahmen des Versorgungsmanagements (' + c.cite('sgb5_11') + ') sowie Ihrer Beratungspflicht (' + c.cite('sgb1_14') + ') bei der Terminvergabe.');
        if (o.appointment) req.push('Bitte teilen Sie mir mit, wie Sie sicherstellen, dass ich innerhalb der gesetzlichen Frist von vier Wochen einen fachärztlichen Termin erhalte (' + c.cite('sgb5_75') + ').');
        if (o.reimbursement) req.push('Sollten Sie die Leistung nicht rechtzeitig als Sachleistung zur Verfügung stellen können, beantrage ich vorsorglich die Erstattung der Kosten einer selbst beschafften Leistung nach ' + c.cite('sgb5_13_3') + '.');
        parts.push(req.map((r, i) => (i + 1) + ') ' + r).join('\n\n'));
        let closing = 'Die Sozialleistungsträger sind verpflichtet, darauf hinzuwirken, dass ich die mir zustehenden Leistungen umfassend und zügig erhalte (' + c.cite('sgb1_17') + ').';
        if (o.deadline) closing += ' Ich weise vorsorglich auf die Entscheidungsfristen nach ' + c.cite('sgb5_13_3a') + ' hin (drei Wochen, bei Einschaltung des Medizinischen Dienstes fünf Wochen).';
        closing += ' Sollten Sie meinen Antrag ganz oder teilweise ablehnen, bitte ich um eine ausführliche Begründung (' + c.cite('sgb10_35') + ') und um eine Kopie etwaiger Gutachten des Medizinischen Dienstes.';
        parts.push(closing);
        if (c.extra) parts.push(c.extra.trim());
        parts.push(signature(c));
        const att = attachmentList(c);
        if (att) parts.push(att);
        return letter({ sender: sender(c), recipient: insurer(c), info: info(c),
          subject: 'Antrag auf Beratung, Versorgungsmanagement und Kostenzusage für eine leitliniengerechte Endometriose-Diagnostik' }, parts);
      }
    },

    {
      id: 'widerspruch',
      title: 'Widerspruch gegen einen Ablehnungsbescheid',
      description: 'Frist: in der Regel ein Monat ab Zugang des Bescheids (§ 84 SGG). Den Widerspruch kannst du fristwahrend einlegen und die Begründung nachreichen.',
      fields: [
        { id: 'decision', label: 'Bescheid', type: 'decision' },
        { id: 'kind', label: 'Was wurde abgelehnt? (bestimmt die rechtliche Begründung)', type: 'select', options: [
          { value: 'diagnostics', label: 'Diagnostik (z. B. MRT, Ultraschall, Laparoskopie)' },
          { value: 'treatment', label: 'Behandlung / Operation (z. B. im Endometriosezentrum)' },
          { value: 'drug', label: 'Medikament / Hormontherapie' },
          { value: 'rehab', label: 'Medizinische Rehabilitation' }
        ] },
        { id: 'claim', label: 'Was soll die Kasse bewilligen?', type: 'text', placeholder: 'z. B. MRT des Beckens / Behandlung im Endometriosezentrum' },
        { id: 'own', label: 'Eigene Begründung / ärztliche Stellungnahme (optional)', type: 'textarea' }
      ],
      options: [
        { id: 'deferReasons', label: 'Begründung erst nach Akteneinsicht nachreichen (fristwahrend)', default: false },
        { id: 'file', label: 'Akteneinsicht und Kopie des MD-Gutachtens beantragen (§ 25 SGB X)', default: true },
        { id: 'guideline', label: 'Medizinischer Standard (Leitlinien)', default: true },
        { id: 'delay', label: 'Diagnoseverzögerung & Wirtschaftlichkeit (Studien)', default: true },
        { id: 'bias', label: 'Bagatellisierung / Gender-Bias bei Schmerz', default: false },
        { id: 'rights', label: 'Grund- und Menschenrechte', default: true },
        { id: 'attachDiary', label: 'Schmerztagebuch als Anlage erwähnen', default: (c) => !!c.stats },
        { id: 'attachChronology', label: 'Chronologie als Anlage erwähnen', default: (c) => c.encounters.length > 0 }
      ],
      build(c) {
        const o = c.opt;
        const d = c.decisions.find((x) => x.id === c.f.decision) || {};
        const dDate = d.date ? c.fmt(d.date) : '[Datum des Bescheids]';
        const claim = c.f.claim || d.what || '[beantragte Leistung]';
        const parts = [];
        parts.push('Sehr geehrte Damen und Herren,');
        parts.push('hiermit lege ich gegen Ihren Bescheid vom ' + dDate + (d.ref ? ' (Az. ' + d.ref + ')' : '') + ' Widerspruch ein (' + c.cite('sgg_84') + '). Ich beantrage, den Bescheid aufzuheben und mir folgende Leistung zu bewilligen: ' + claim + '.');
        if (o.file) parts.push('Zur Begründung beantrage ich zunächst Akteneinsicht (' + c.cite('sgb10_25') + '), insbesondere die Übersendung einer Kopie aller Gutachten und Stellungnahmen des Medizinischen Dienstes, auf die Sie Ihre Entscheidung stützen.');
        if (o.deferReasons) {
          parts.push('Die ausführliche Begründung reiche ich nach Eingang der Unterlagen nach. Bitte entscheiden Sie nicht vor Ablauf einer angemessenen Frist hierfür.');
        } else {
          parts.push('Begründung');
          if (d.reason) parts.push('Sie begründen die Ablehnung wie folgt: „' + d.reason.trim().replace(/[.!]+$/, '') + '“. Diese Begründung trägt die Entscheidung aus den folgenden Gründen nicht.');
          parts.push(symptomParagraph(c));
          const h = historyParagraph(c);
          if (h) parts.push(h);
          objectionBasis(c, c.f.kind || 'diagnostics', o).forEach((p) => parts.push(p));
          if (o.bias) parts.push(biasParagraph(c));
          if (o.rights) parts.push(rightsParagraph(c));
          if (c.f.own) parts.push(c.f.own);
        }
        parts.push('Bitte bestätigen Sie mir den Eingang dieses Widerspruchs schriftlich.');
        if (c.extra) parts.push(c.extra.trim());
        parts.push(signature(c));
        const att = attachmentList(c);
        if (att) parts.push(att);
        return letter({ sender: sender(c), recipient: insurer(c), info: info(c, { ref: d.ref || '[Aktenzeichen]' }),
          subject: 'Widerspruch gegen Ihren Bescheid vom ' + dDate }, parts);
      }
    },

    {
      id: 'praxis',
      title: 'Brief an die Praxis: Überweisung erbitten, Ablehnung dokumentieren lassen',
      description: 'Bittet um Überweisung an ein Endometriosezentrum – und darum, eine Ablehnung schriftlich zu begründen und in der Patientenakte zu dokumentieren.',
      fields: [
        { id: 'doctor', label: 'Praxis / Ärzt*in', type: 'text' },
        { id: 'doctorStreet', label: 'Straße', type: 'text' },
        { id: 'doctorZipCity', label: 'PLZ, Ort', type: 'text' }
      ],
      options: [
        { id: 'guideline', label: 'Medizinischer Standard (Leitlinien)', default: true },
        { id: 'urgent', label: 'Um Dringlichkeitscode für die Terminservicestelle bitten', default: true },
        { id: 'attachDiary', label: 'Schmerztagebuch als Anlage erwähnen', default: (c) => !!c.stats }
      ],
      build(c) {
        const o = c.opt;
        const parts = [];
        parts.push('Sehr geehrte Damen und Herren,');
        parts.push('ich bin bei Ihnen in Behandlung und möchte meine Beschwerden noch einmal schriftlich zusammenfassen.');
        parts.push(symptomParagraph(c));
        if (o.guideline) parts.push(guidelineParagraph(c));
        let req = 'Ich bitte Sie daher um eine Überweisung an ein zertifiziertes Endometriosezentrum bzw. eine auf Endometriose spezialisierte gynäkologische Einrichtung';
        req += o.urgent ? ', gerne mit Dringlichkeitskennzeichnung für die Terminservicestelle (' + c.cite('sgb5_75') + ').' : '.';
        parts.push(req);
        parts.push('Falls Sie eine weitere Abklärung für nicht erforderlich halten, bitte ich Sie, mir die medizinischen Gründe hierfür zu erläutern (' + c.cite('bgb_630c') + ') und Ihre Entscheidung samt Begründung in meiner Patientenakte zu dokumentieren (' + c.cite('bgb_630f') + '). Ich behalte mir vor, eine Kopie meiner Patientenakte anzufordern (' + c.cite('bgb_630g') + ').');
        if (c.extra) parts.push(c.extra.trim());
        parts.push(signature(c));
        const att = attachmentList(c);
        if (att) parts.push(att);
        return letter({ sender: sender(c), recipient: doctor(c), info: info(c, { insured: false }),
          subject: 'Bitte um Überweisung zur Endometriose-Abklärung' }, parts);
      }
    },

    {
      id: 'akte',
      title: 'Kopie der Patientenakte anfordern',
      description: 'Befunde, Arztbriefe, Bilder – die erste Kopie ist kostenlos (Art. 15 Abs. 3 DSGVO, EuGH C-307/22). Wichtig als Beweis und für Zweitmeinungen.',
      fields: [
        { id: 'doctor', label: 'Praxis / Klinik', type: 'text' },
        { id: 'doctorStreet', label: 'Straße', type: 'text' },
        { id: 'doctorZipCity', label: 'PLZ, Ort', type: 'text' },
        { id: 'period', label: 'Zeitraum (optional)', type: 'text', placeholder: 'z. B. seit 2018' }
      ],
      options: [
        { id: 'digital', label: 'Übersendung gern elektronisch (verschlüsselt) oder auf Datenträger', default: true }
      ],
      build(c) {
        const parts = [];
        parts.push('Sehr geehrte Damen und Herren,');
        parts.push('hiermit bitte ich um eine vollständige Kopie meiner Patientenakte' + (c.f.period ? ' (' + c.f.period + ')' : '') + ', einschließlich aller Befunde, Arztbriefe, Laborwerte, Bildgebung (Ultraschall-, MRT-Aufnahmen und Befundberichte) sowie Operations- und Histologieberichte.');
        parts.push('Mein Anspruch ergibt sich aus ' + c.cite('bgb_630g') + ' sowie aus ' + c.cite('dsgvo_15') + '. Die erste Kopie ist nach Art. 15 Abs. 3 DSGVO unentgeltlich zur Verfügung zu stellen; einer Begründung bedarf es nicht (' + c.cite('eugh_c307') + ').');
        if (c.opt.digital) parts.push('Die Übersendung kann gern elektronisch in verschlüsselter Form oder auf einem Datenträger erfolgen.');
        parts.push('Ich bitte um Übersendung innerhalb eines Monats (' + c.cite('dsgvo_12') + ').');
        if (c.extra) parts.push(c.extra.trim());
        parts.push(signature(c));
        return letter({ sender: sender(c), recipient: doctor(c), info: info(c, { insured: false }),
          subject: 'Anforderung einer Kopie meiner Patientenakte' }, parts);
      }
    },

    {
      id: 'chronologie',
      title: 'Chronologie / Gedächtnisprotokoll (Anlage)',
      description: 'Listet alle Arztbesuche, Aussagen und Bescheide zeitlich geordnet. Als Anlage für Kasse, Widerspruch, Zweitmeinung oder Beschwerde.',
      options: [
        { id: 'summary', label: 'Beschwerdezusammenfassung voranstellen', default: true }
      ],
      build(c) {
        const parts = [];
        parts.push('Chronologie des Behandlungsverlaufs');
        parts.push((c.p.name || '[Name]') + (c.p.birthdate ? ', geb. ' + c.fmt(c.p.birthdate) : '') + '\nErstellt am ' + c.fmt(c.today));
        if (c.opt.summary) parts.push(symptomParagraph(c));
        parts.push(chronologyText(c) || '[Noch keine Einträge unter „Ärzt*innen & Bescheide“.]');
        if (c.extra) parts.push(c.extra.trim());
        parts.push('Die obigen Angaben habe ich nach bestem Wissen und zeitnah zu den jeweiligen Terminen festgehalten. Als wörtlich gekennzeichnete Aussagen gebe ich im Wortlaut wieder.');
        parts.push('\n\n' + placeDate(c) + '\n\n\n' + (c.p.name || '[Unterschrift]'));
        return parts.join('\n\n');
      }
    }
  ];

  /* Widerspruchsfrist: Bekanntgabe am 4. Tag nach Aufgabe zur Post (§ 37 Abs. 2 SGB X,
   * seit 1.1.2025), dann ein Monat (§ 84 SGG); fällt das Ende auf Sa/So, läuft sie
   * bis zum nächsten Werktag (§ 64 Abs. 3 SGG). Feiertage werden nicht berücksichtigt. */
  function objectionDeadline(decisionDate, FE) {
    const d = FE.parseIso(decisionDate);
    if (!d) return null;
    return FE.nextWorkday(FE.addMonths(FE.addDays(d, 4), 1));
  }

  /* Wie verschicken? Angezeigt unter dem Brief. */
  const sendingTips = [
    'Antrag an die Kasse: Anträge sind grundsätzlich formlos möglich. Hochladen als PDF über die App oder das Online-Postfach deiner Kasse funktioniert in der Regel – Eingangsbestätigung bzw. Screenshot aufheben.',
    'Widerspruch: muss „schriftlich oder zur Niederschrift“ eingelegt werden (§ 84 SGG). Sicher sind Brief per Einschreiben, Fax mit Sendebericht oder persönliche Abgabe gegen Eingangsstempel. Eine einfache E-Mail reicht nach herrschender Meinung nicht. Das Online-Postfach der Kasse genügt nur, wenn die Kasse es ausdrücklich für Widersprüche anbietet (§ 36a SGB I) – im Zweifel zusätzlich per Post oder Fax.',
    'Eine eingefügte Unterschrift im PDF ist keine qualifizierte elektronische Signatur. Für Anträge und die Anforderung der Patientenakte reicht das, für den Widerspruch per E-Mail nicht.',
    'Immer eine Kopie des Briefs und aller Anlagen behalten und die Frist im Kalender notieren.'
  ];

  FightEndo.registerJurisdiction({
    id: 'de',
    name: 'Deutschland (gesetzliche Krankenversicherung)',
    language: 'de',
    lastReviewed: '2026-09',
    closing: CLOSING,
    pageLabel: 'Seite {i} von {n}',
    referencesHeading: 'Quellen',
    sendingTips,
    dateFormat: (d) => d.split('-').reverse().join('.'),
    objectionDeadline,
    sources,
    resources,
    letters,
    // Optional: a finished example letter with a fictional person, shown from the start page.
    example: {
      letter: 'kk-antrag',
      state: {
        person: {
          name: 'Maria Muster', street: 'Beispielstraße 12', zipCity: '12345 Musterstadt', birthdate: '1996-05-14',
          insuranceNumber: 'X123456789', insurer: 'Musterkasse', insurerStreet: 'Postfach 1000', insurerZipCity: '12340 Musterstadt'
        },
        symptoms: {
          checked: { dysmenorrhea: true, chronicPelvicPain: true, dyschezia: true, fatigue: true, nausea: true },
          dysmenorrheaNrs: '9', dailyImpact: true, onsetYear: '2014', missedDays: '3', emergencyVisits: '2',
          diagnosis: 'suspected', painkillers: 'Ibuprofen 600, Metamizol', painkillerEffect: 'partial',
          hormones: 'Pille, Dienogest', hormoneEffect: 'side'
        },
        diary: [
          { id: 'x1', date: '2026-08-03', pain: '9', bleeding: 'heavy', missed: true, notes: '' },
          { id: 'x2', date: '2026-08-04', pain: '7', bleeding: 'medium', missed: true, notes: '' },
          { id: 'x3', date: '2026-08-31', pain: '8', bleeding: 'heavy', missed: true, notes: '' },
          { id: 'x4', date: '2026-09-01', pain: '6', bleeding: 'medium', missed: false, notes: '' }
        ],
        encounters: [
          { id: 'y1', date: '2025-11-20', who: 'Frauenarztpraxis (Beispiel)', specialty: 'Gynäkologie', said: 'Regelschmerzen sind normal, da müssen Sie durch.', refused: 'Überweisung an ein Endometriosezentrum', verbatim: true, witness: '' }
        ],
        decisions: []
      }
    }
  });
})();
