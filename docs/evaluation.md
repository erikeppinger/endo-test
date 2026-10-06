# Evaluation: Briefgenerator gegen Fallbeispiele

Automatisch erzeugt von `npm run eval` aus `tests/cases/cases.json`. Die Fälle sind anonymisierte, zusammengesetzte Szenarien nach öffentlich berichteten Mustern.

| Fall | Brief | Ergebnis |
|---|---|---|
| delay-20-years | kk-antrag | ✓ |
| hormones-dienogest | widerspruch | ✓ |
| rehab-refused | widerspruch | ✓ |
| mri-refused | widerspruch | ✓ |
| teen-school | praxis | ✓ |

## 20 Jahre abgetan, jetzt Antrag an die Kasse

**Muster:** Diagnoseverzögerung über Jahrzehnte, wiederholt als normal abgetan (vgl. Medienberichte über ~20 Jahre bis zur Diagnose).  
**Quellen:** <https://www.aol.com/woman-33-says-took-20-200000999.html>, <https://www.pressreader.com/ireland/irish-daily-mail/20220509/281835762287117>

**Prüfung:** alle Erwartungen erfüllt

```text
Fall A
Weg 1
50667 Köln

Beispiel-BKK
Str. 2
50668 Köln

Versichertennr.: B000000001
Datum: 27.09.2026

Antrag auf Beratung, Versorgungsmanagement und Kostenzusage für eine leitliniengerechte Endometriose-Diagnostik

Sehr geehrte Damen und Herren,

hiermit beantrage ich Ihre Unterstützung bei der leitliniengerechten Abklärung einer Endometriose. Ich bitte um eine schriftliche, rechtsmittelfähige Entscheidung.

1. Sachverhalt

Ich leide seit 2006 unter folgenden Beschwerden:
  – Starke Regelschmerzen
  – Unterbauch-/Beckenschmerzen auch außerhalb der Periode (seit ≥ 6 Monaten)
  – Schmerzen beim Stuhlgang, v. a. rund um die Periode
  – Erschöpfung / Fatigue
  – Starke psychische Belastung durch die Beschwerden

Die Regelschmerzen erreichen auf der Schmerzskala (0–10) einen Wert von 10. Die Schmerzen hindern mich regelmäßig an der Teilnahme an Arbeit bzw. Ausbildung und Alltag. Ich falle deswegen ca. 4 Tage pro Monat aus. Ich musste deswegen bereits 3-mal eine Notaufnahme aufsuchen. Schmerzmittel (Ibuprofen, Metamizol): ohne ausreichende Wirkung.

Damit bestehen die Beschwerden seit rund 20 Jahren, ohne dass eine gezielte Abklärung auf Endometriose erfolgt ist.

Bisheriger Behandlungsverlauf:
  – 01.03.2012, Praxis 1 (Gynäkologie): „Das ist normal, das haben viele.“
  – 01.06.2018, Praxis 2 (Allgemeinmedizin): „Stress, versuchen Sie Entspannung.“
  – 01.10.2025, Notaufnahme: „Kein Befund, gehen Sie zum Frauenarzt.“ Abgelehnt/nicht durchgeführt: Bildgebung.

2. Medizinische und rechtliche Begründung

Nach § 27 Abs. 1 SGB V habe ich Anspruch auf Krankenbehandlung, wenn sie notwendig ist, um eine Krankheit zu erkennen, zu heilen, ihre Verschlimmerung zu verhüten oder Krankheitsbeschwerden zu lindern. Qualität und Wirksamkeit der Leistungen haben dem allgemein anerkannten Stand der medizinischen Erkenntnisse zu entsprechen (§ 2 Abs. 1 S. 3 SGB V).

Nach dem allgemein anerkannten Stand der medizinischen Erkenntnisse sind diese Beschwerden ein ausdrücklicher Anlass, an Endometriose zu denken und gezielt abzuklären (NICE NG73; ESHRE-Leitlinie Endometriose 2022; AWMF S2k-Leitlinie Endometriose (Reg.-Nr. 015-045)). Die Leitlinien sehen hierfür insbesondere eine gynäkologische Untersuchung, eine spezialisierte transvaginale Sonographie, gegebenenfalls eine MRT sowie – wo angezeigt – eine Laparoskopie mit histologischer Sicherung vor. Endometriose betrifft rund jede zehnte Frau im reproduktiven Alter (WHO-Faktenblatt Endometriose; Zondervan et al., NEJM 2020). Die bloße Einordnung als „normale Regelschmerzen“ entspricht diesem Standard nicht.

Die Diagnose von Endometriose verzögert sich im deutschsprachigen Raum im Durchschnitt um viele Jahre; Studien zeigen, dass die Beschwerden dabei häufig normalisiert oder bagatellisiert werden (Hudelist et al., Hum Reprod 2012; Ballard et al., Fertil Steril 2006). Die Erkrankung mindert Lebensqualität und Arbeitsfähigkeit erheblich (Nnoaham et al., Fertil Steril 2011). Eine frühzeitige, gezielte Diagnostik ist daher nicht nur medizinisch geboten, sondern auch im Sinne des Wirtschaftlichkeitsgebots (§ 12 Abs. 1 SGB V) sinnvoller als jahrelange ergebnislose Einzelbehandlungen.

Mehrere der oben dokumentierten Äußerungen stellen keine medizinische Begründung dar. Die Forschung belegt eine systematische Unterschätzung von Schmerzen bei Frauen (Hoffmann & Tarzian, J Law Med Ethics 2001; Samulowitz et al., Pain Res Manag 2018). Nach § 2b SGB V ist bei den Leistungen der Krankenkassen geschlechtsspezifischen Besonderheiten Rechnung zu tragen; nach § 2a SGB V ist den besonderen Belangen chronisch kranker Menschen Rechnung zu tragen.

Ich weise darauf hin, dass die Leistungsgewährung der gesetzlichen Krankenversicherung an meinem Grundrecht auf körperliche Unversehrtheit (Art. 2 Abs. 2 S. 1 GG) und am Gleichberechtigungsgebot (Art. 3 Abs. 2 GG, Art. 3 Abs. 3 S. 1 GG) zu messen ist (vgl. BVerfG, Beschl. v. 6.12.2005 – 1 BvR 347/98). Auch die UN-Frauenrechtskonvention verpflichtet Deutschland, Diskriminierung von Frauen im Gesundheitswesen zu beseitigen (Art. 12 CEDAW); der UN-Sozialpakt garantiert das erreichbare Höchstmaß an Gesundheit (Art. 12 UN-Sozialpakt).

3. Meine Anträge

1) Bitte bestätigen Sie mir schriftlich, dass Sie die Kosten einer leitliniengerechten Endometriose-Diagnostik übernehmen (spezialisierte Sonographie, bei Bedarf MRT und – falls ärztlich indiziert – diagnostische Laparoskopie mit Histologie).

2) Bitte benennen Sie mir zertifizierte Endometriosezentren bzw. spezialisierte Einrichtungen in zumutbarer Entfernung und unterstützen Sie mich im Rahmen des Versorgungsmanagements (§ 11 Abs. 4 SGB V) sowie Ihrer Beratungspflicht (§ 14 SGB I) bei der Terminvergabe.

3) Bitte teilen Sie mir mit, wie Sie sicherstellen, dass ich innerhalb der gesetzlichen Frist von vier Wochen einen fachärztlichen Termin erhalte (§ 75 Abs. 1a SGB V).

Die Sozialleistungsträger sind verpflichtet, darauf hinzuwirken, dass ich die mir zustehenden Leistungen umfassend und zügig erhalte (§ 17 Abs. 1 Nr. 1 SGB I). Ich weise vorsorglich auf die Entscheidungsfristen nach § 13 Abs. 3a SGB V hin (drei Wochen, bei Einschaltung des Medizinischen Dienstes fünf Wochen). Sollten Sie meinen Antrag ganz oder teilweise ablehnen, bitte ich um eine ausführliche Begründung (§ 35 SGB X) und um eine Kopie etwaiger Gutachten des Medizinischen Dienstes.

Mit freundlichen Grüßen


Fall A

Anlagen:
  – Chronologie des Behandlungsverlaufs

Quellen:
[1] § 27 Abs. 1 SGB V: Anspruch auf Krankenbehandlung (Krankheit erkennen, heilen, Verschlimmerung verhüten, Beschwerden lindern). https://www.gesetze-im-internet.de/sgb_5/__27.html
[2] § 2 Abs. 1 S. 3 SGB V: Leistungen müssen dem allgemein anerkannten Stand der medizinischen Erkenntnisse entsprechen. https://www.gesetze-im-internet.de/sgb_5/__2.html
[3] NICE NG73: Endometriosis: diagnosis and management (UK National Institute for Health and Care Excellence). https://www.nice.org.uk/guidance/ng73
[4] ESHRE-Leitlinie Endometriose 2022: Becker CM et al. ESHRE guideline: endometriosis. Hum Reprod Open 2022;2022(2):hoac009. DOI: 10.1093/hropen/hoac009 – https://doi.org/10.1093/hropen/hoac009
[5] AWMF S2k-Leitlinie Endometriose (Reg.-Nr. 015-045): Diagnostik und Therapie der Endometriose – DGGG, SGGG, OEGGG. https://register.awmf.org/de/leitlinien/detail/015-045
[6] WHO-Faktenblatt Endometriose: Rund 10 % der Frauen und Mädchen im reproduktiven Alter sind betroffen. https://www.who.int/news-room/fact-sheets/detail/endometriosis
[7] Zondervan et al., NEJM 2020: Zondervan KT, Becker CM, Missmer SA. Endometriosis. N Engl J Med 2020;382:1244–1256. DOI: 10.1056/NEJMra1810764 – https://doi.org/10.1056/NEJMra1810764
[8] Hudelist et al., Hum Reprod 2012: Diagnostic delay for endometriosis in Austria and Germany: causes and possible consequences. Hum Reprod 2012;27(12):3412–3416. DOI: 10.1093/humrep/des316 – https://doi.org/10.1093/humrep/des316
[9] Ballard et al., Fertil Steril 2006: What’s the delay? A qualitative study of women’s experiences of reaching a diagnosis of endometriosis. Fertil Steril 2006;86(5):1296–1301. DOI: 10.1016/j.fertnstert.2006.04.057 – https://doi.org/10.1016/j.fertnstert.2006.04.057
[10] Nnoaham et al., Fertil Steril 2011: Impact of endometriosis on quality of life and work productivity: a multicenter study across ten countries. Fertil Steril 2011;96(2):366–373. DOI: 10.1016/j.fertnstert.2011.05.090 – https://doi.org/10.1016/j.fertnstert.2011.05.090
[11] § 12 Abs. 1 SGB V: Wirtschaftlichkeitsgebot: ausreichend, zweckmäßig, wirtschaftlich. https://www.gesetze-im-internet.de/sgb_5/__12.html
[12] Hoffmann & Tarzian, J Law Med Ethics 2001: The girl who cried pain: a bias against women in the treatment of pain. J Law Med Ethics 2001;29(1):13–27. DOI: 10.1111/j.1748-720X.2001.tb00037.x – https://doi.org/10.1111/j.1748-720X.2001.tb00037.x
[13] Samulowitz et al., Pain Res Manag 2018: “Brave men” and “emotional women”: gender bias in health care and gendered norms towards patients with chronic pain. Pain Res Manag 2018:6358624. DOI: 10.1155/2018/6358624 – https://doi.org/10.1155/2018/6358624
[14] § 2b SGB V: Geschlechtsspezifischen Besonderheiten ist Rechnung zu tragen. https://www.gesetze-im-internet.de/sgb_5/__2b.html
[15] § 2a SGB V: Besondere Belange chronisch kranker Menschen. https://www.gesetze-im-internet.de/sgb_5/__2a.html
[16] Art. 2 Abs. 2 S. 1 GG: Recht auf Leben und körperliche Unversehrtheit. https://www.gesetze-im-internet.de/gg/art_2.html
[17] Art. 3 Abs. 2 GG: Gleichberechtigung; Staat wirkt auf Beseitigung bestehender Nachteile hin. https://www.gesetze-im-internet.de/gg/art_3.html
[18] Art. 3 Abs. 3 S. 1 GG: Niemand darf wegen des Geschlechts benachteiligt werden. https://www.gesetze-im-internet.de/gg/art_3.html
[19] BVerfG, Beschl. v. 6.12.2005 – 1 BvR 347/98: Leistungsrecht der GKV ist an Art. 2 Abs. 1 GG i. V. m. Sozialstaatsprinzip und Art. 2 Abs. 2 GG zu messen (Anlass: lebensbedrohliche Erkrankung). https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2005/12/rs20051206_1bvr034798.html
[20] Art. 12 CEDAW: UN-Frauenrechtskonvention: Beseitigung der Diskriminierung von Frauen im Gesundheitswesen. https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-elimination-all-forms-discrimination-against-women
[21] Art. 12 UN-Sozialpakt: Recht auf das erreichbare Höchstmaß an körperlicher und geistiger Gesundheit. https://www.ohchr.org/en/instruments-mechanisms/instruments/international-covenant-economic-social-and-cultural-rights
[22] § 11 Abs. 4 SGB V: Anspruch auf Versorgungsmanagement. https://www.gesetze-im-internet.de/sgb_5/__11.html
[23] § 14 SGB I: Anspruch auf Beratung durch den Leistungsträger. https://www.gesetze-im-internet.de/sgb_1/__14.html
[24] § 75 Abs. 1a SGB V: Terminservicestellen: Facharzttermin innerhalb von vier Wochen. https://www.gesetze-im-internet.de/sgb_5/__75.html
[25] § 17 Abs. 1 Nr. 1 SGB I: Sozialleistungen sind umfassend und zügig zu erbringen. https://www.gesetze-im-internet.de/sgb_1/__17.html
[26] § 13 Abs. 3a SGB V: Entscheidungsfristen der Krankenkasse (3 bzw. 5 Wochen). https://www.gesetze-im-internet.de/sgb_5/__13.html
[27] § 35 SGB X: Begründungspflicht für Bescheide. https://www.gesetze-im-internet.de/sgb_10/__35.html
```

## Widerspruch: Alternative Hormontherapie abgelehnt

**Muster:** Kasse übernimmt nur Dienogest; die Patientin verträgt es nicht, eine alternative Hormontherapie wird abgelehnt (Thema einer öffentlichen Petition).  
**Quellen:** <https://www.openpetition.de/petition/online/kostenuebernahme-von-hormonen-bei-endometriose-durch-die-krankenkasse>

**Prüfung:** alle Erwartungen erfüllt

```text
Fall B
Weg 2
80331 München

Beispiel-AOK
Str. 3
80332 München

Ihr Zeichen: HV-4711
Versichertennr.: B000000002
Geburtsdatum: 05.05.1998
Datum: 27.09.2026

Widerspruch gegen Ihren Bescheid vom 10.09.2026

Sehr geehrte Damen und Herren,

hiermit lege ich gegen Ihren Bescheid vom 10.09.2026 (Az. HV-4711) Widerspruch ein (§ 84 Abs. 1 SGG). Ich beantrage, den Bescheid aufzuheben und mir folgende Leistung zu bewilligen: Kostenübernahme einer alternativen Hormontherapie (Kombinationspräparat im Langzyklus).

Zur Begründung beantrage ich zunächst Akteneinsicht (§ 25 SGB X), insbesondere die Übersendung einer Kopie aller Gutachten und Stellungnahmen des Medizinischen Dienstes, auf die Sie Ihre Entscheidung stützen.

Begründung

Sie begründen die Ablehnung wie folgt: „Kontrazeptiva sind ab dem 22. Lebensjahr keine Kassenleistung“. Diese Begründung trägt die Entscheidung aus den folgenden Gründen nicht.

Ich leide seit 2012 unter folgenden Beschwerden:
  – Starke Regelschmerzen
  – Tiefe Schmerzen beim oder nach dem Geschlechtsverkehr
  – Erschöpfung / Fatigue

Bei mir wurde im Jahr 2021 eine Endometriose diagnostiziert.

Die Regelschmerzen erreichen auf der Schmerzskala (0–10) einen Wert von 8. Die Schmerzen hindern mich regelmäßig an der Teilnahme an Arbeit bzw. Ausbildung und Alltag. Hormonelle Behandlung (Dienogest 2 mg): abgebrochen wegen Nebenwirkungen.

Damit bestehen die Beschwerden seit rund 14 Jahren.

Ich habe Anspruch auf Krankenbehandlung, die notwendig ist, um Krankheitsbeschwerden zu lindern und eine Verschlimmerung zu verhüten (§ 27 Abs. 1 SGB V), einschließlich der Versorgung mit Arzneimitteln (§ 31 Abs. 1 SGB V). Qualität und Wirksamkeit der Leistungen haben dem allgemein anerkannten Stand der medizinischen Erkenntnisse zu entsprechen (§ 2 Abs. 1 S. 3 SGB V).

Das Präparat dient nicht der Empfängnisverhütung, sondern der Behandlung meiner Endometriose-Beschwerden. Der Leistungsausschluss für Verhütungsmittel (§ 24a SGB V) ist daher nicht einschlägig. Hormonelle Therapien – darunter Gestagene und kombinierte hormonale Präparate – gehören nach der Leitlinie zu den empfohlenen Behandlungsoptionen bei Endometriose-Schmerzen (ESHRE-Leitlinie Endometriose 2022; AWMF S2k-Leitlinie Endometriose (Reg.-Nr. 015-045)).

Soweit das Präparat für diese Indikation nicht zugelassen ist, liegen die Voraussetzungen für einen Off-Label-Use zulasten der gesetzlichen Krankenversicherung vor (BSG, Urt. v. 19.3.2002 – B 1 KR 37/00 R): Es handelt sich um eine die Lebensqualität auf Dauer nachhaltig beeinträchtigende Erkrankung, die zugelassene Alternative kommt für mich wegen Nebenwirkungen nicht in Betracht, und nach dem Stand der Wissenschaft besteht eine begründete Aussicht auf einen Behandlungserfolg.

Ich weise darauf hin, dass die Leistungsgewährung der gesetzlichen Krankenversicherung an meinem Grundrecht auf körperliche Unversehrtheit (Art. 2 Abs. 2 S. 1 GG) und am Gleichberechtigungsgebot (Art. 3 Abs. 2 GG, Art. 3 Abs. 3 S. 1 GG) zu messen ist (vgl. BVerfG, Beschl. v. 6.12.2005 – 1 BvR 347/98). Auch die UN-Frauenrechtskonvention verpflichtet Deutschland, Diskriminierung von Frauen im Gesundheitswesen zu beseitigen (Art. 12 CEDAW); der UN-Sozialpakt garantiert das erreichbare Höchstmaß an Gesundheit (Art. 12 UN-Sozialpakt).

Bitte bestätigen Sie mir den Eingang dieses Widerspruchs schriftlich.

Mit freundlichen Grüßen


Fall B

Quellen:
[1] § 84 Abs. 1 SGG: Widerspruch binnen eines Monats nach Bekanntgabe. https://www.gesetze-im-internet.de/sgg/__84.html
[2] § 25 SGB X: Akteneinsicht im Verwaltungsverfahren. https://www.gesetze-im-internet.de/sgb_10/__25.html
[3] § 2 Abs. 1 S. 3 SGB V: Leistungen müssen dem allgemein anerkannten Stand der medizinischen Erkenntnisse entsprechen. https://www.gesetze-im-internet.de/sgb_5/__2.html
[4] § 27 Abs. 1 SGB V: Anspruch auf Krankenbehandlung (Krankheit erkennen, heilen, Verschlimmerung verhüten, Beschwerden lindern). https://www.gesetze-im-internet.de/sgb_5/__27.html
[5] § 31 Abs. 1 SGB V: Anspruch auf Versorgung mit Arzneimitteln. https://www.gesetze-im-internet.de/sgb_5/__31.html
[6] § 24a SGB V: Empfängnisverhütung (Altersgrenze gilt nur für Verhütungsmittel, nicht für Therapie). https://www.gesetze-im-internet.de/sgb_5/__24a.html
[7] ESHRE-Leitlinie Endometriose 2022: Becker CM et al. ESHRE guideline: endometriosis. Hum Reprod Open 2022;2022(2):hoac009. DOI: 10.1093/hropen/hoac009 – https://doi.org/10.1093/hropen/hoac009
[8] AWMF S2k-Leitlinie Endometriose (Reg.-Nr. 015-045): Diagnostik und Therapie der Endometriose – DGGG, SGGG, OEGGG. https://register.awmf.org/de/leitlinien/detail/015-045
[9] BSG, Urt. v. 19.3.2002 – B 1 KR 37/00 R: Off-Label-Use zulasten der GKV: schwerwiegende Erkrankung, keine Alternative, begründete Erfolgsaussicht. https://dejure.org/dienste/vernetzung/rechtsprechung?Gericht=BSG&Datum=19.03.2002&Aktenzeichen=B%201%20KR%2037%2F00%20R
[10] Art. 2 Abs. 2 S. 1 GG: Recht auf Leben und körperliche Unversehrtheit. https://www.gesetze-im-internet.de/gg/art_2.html
[11] Art. 3 Abs. 2 GG: Gleichberechtigung; Staat wirkt auf Beseitigung bestehender Nachteile hin. https://www.gesetze-im-internet.de/gg/art_3.html
[12] Art. 3 Abs. 3 S. 1 GG: Niemand darf wegen des Geschlechts benachteiligt werden. https://www.gesetze-im-internet.de/gg/art_3.html
[13] BVerfG, Beschl. v. 6.12.2005 – 1 BvR 347/98: Leistungsrecht der GKV ist an Art. 2 Abs. 1 GG i. V. m. Sozialstaatsprinzip und Art. 2 Abs. 2 GG zu messen (Anlass: lebensbedrohliche Erkrankung). https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2005/12/rs20051206_1bvr034798.html
[14] Art. 12 CEDAW: UN-Frauenrechtskonvention: Beseitigung der Diskriminierung von Frauen im Gesundheitswesen. https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-elimination-all-forms-discrimination-against-women
[15] Art. 12 UN-Sozialpakt: Recht auf das erreichbare Höchstmaß an körperlicher und geistiger Gesundheit. https://www.ohchr.org/en/instruments-mechanisms/instruments/international-covenant-economic-social-and-cultural-rights
```

## Widerspruch: Reha abgelehnt

**Muster:** Medizinische Reha in einer Endometriose-Reha-Klinik abgelehnt; Zuständigkeit Kasse vs. Rentenversicherung unklar.  
**Quellen:** <https://www.endometriose-doc.de/alltag/reha-bei-endometriose-wer-anspruch-hat-wann-sie-bewilligt-wird-1450107.html>

**Prüfung:** alle Erwartungen erfüllt

```text
Fall C
Weg 3
20095 Hamburg

Beispiel-Kasse
Str. 4
20096 Hamburg

Ihr Zeichen: R-123
Versichertennr.: B000000003
Datum: 27.09.2026

Widerspruch gegen Ihren Bescheid vom 01.09.2026

Sehr geehrte Damen und Herren,

hiermit lege ich gegen Ihren Bescheid vom 01.09.2026 (Az. R-123) Widerspruch ein (§ 84 Abs. 1 SGG). Ich beantrage, den Bescheid aufzuheben und mir folgende Leistung zu bewilligen: stationäre medizinische Rehabilitation in einer auf Endometriose spezialisierten Klinik.

Zur Begründung beantrage ich zunächst Akteneinsicht (§ 25 SGB X), insbesondere die Übersendung einer Kopie aller Gutachten und Stellungnahmen des Medizinischen Dienstes, auf die Sie Ihre Entscheidung stützen.

Begründung

Sie begründen die Ablehnung wie folgt: „Ambulante Maßnahmen ausreichend“. Diese Begründung trägt die Entscheidung aus den folgenden Gründen nicht.

Ich leide seit 2015 unter folgenden Beschwerden:
  – Starke Regelschmerzen
  – Unterbauch-/Beckenschmerzen auch außerhalb der Periode (seit ≥ 6 Monaten)
  – Erschöpfung / Fatigue
  – Starke psychische Belastung durch die Beschwerden

Die Schmerzen hindern mich regelmäßig an der Teilnahme an Arbeit bzw. Ausbildung und Alltag. Ich falle deswegen ca. 6 Tage pro Monat aus.

Damit bestehen die Beschwerden seit rund 11 Jahren, ohne dass eine gezielte Abklärung auf Endometriose erfolgt ist.

Ich habe Anspruch auf Leistungen zur medizinischen Rehabilitation, wenn ambulante Krankenbehandlung nicht ausreicht, um die Krankheitsfolgen zu mildern (§ 40 SGB V). Soweit die gesetzliche Rentenversicherung zuständig ist, ergibt sich der Anspruch aus § 15 SGB VI. Sollten Sie sich für unzuständig halten, sind Sie verpflichtet, den Antrag an den zuständigen Träger weiterzuleiten (§ 14 SGB IX).

Die bisherigen ambulanten Maßnahmen haben nicht ausgereicht, um meine Beschwerden und deren Folgen für Alltag und Erwerbsfähigkeit ausreichend zu lindern. Den besonderen Belangen chronisch kranker Menschen ist dabei Rechnung zu tragen (§ 2a SGB V).

Ich weise darauf hin, dass die Leistungsgewährung der gesetzlichen Krankenversicherung an meinem Grundrecht auf körperliche Unversehrtheit (Art. 2 Abs. 2 S. 1 GG) und am Gleichberechtigungsgebot (Art. 3 Abs. 2 GG, Art. 3 Abs. 3 S. 1 GG) zu messen ist (vgl. BVerfG, Beschl. v. 6.12.2005 – 1 BvR 347/98). Auch die UN-Frauenrechtskonvention verpflichtet Deutschland, Diskriminierung von Frauen im Gesundheitswesen zu beseitigen (Art. 12 CEDAW); der UN-Sozialpakt garantiert das erreichbare Höchstmaß an Gesundheit (Art. 12 UN-Sozialpakt).

Bitte bestätigen Sie mir den Eingang dieses Widerspruchs schriftlich.

Mit freundlichen Grüßen


Fall C

Quellen:
[1] § 84 Abs. 1 SGG: Widerspruch binnen eines Monats nach Bekanntgabe. https://www.gesetze-im-internet.de/sgg/__84.html
[2] § 25 SGB X: Akteneinsicht im Verwaltungsverfahren. https://www.gesetze-im-internet.de/sgb_10/__25.html
[3] § 2 Abs. 1 S. 3 SGB V: Leistungen müssen dem allgemein anerkannten Stand der medizinischen Erkenntnisse entsprechen. https://www.gesetze-im-internet.de/sgb_5/__2.html
[4] § 40 SGB V: Leistungen zur medizinischen Rehabilitation. https://www.gesetze-im-internet.de/sgb_5/__40.html
[5] § 15 SGB VI: Medizinische Rehabilitation durch die Rentenversicherung. https://www.gesetze-im-internet.de/sgb_6/__15.html
[6] § 14 SGB IX: Zuständigkeitsklärung: Weiterleitung an den zuständigen Rehabilitationsträger. https://www.gesetze-im-internet.de/sgb_9_2018/__14.html
[7] § 2a SGB V: Besondere Belange chronisch kranker Menschen. https://www.gesetze-im-internet.de/sgb_5/__2a.html
[8] Art. 2 Abs. 2 S. 1 GG: Recht auf Leben und körperliche Unversehrtheit. https://www.gesetze-im-internet.de/gg/art_2.html
[9] Art. 3 Abs. 2 GG: Gleichberechtigung; Staat wirkt auf Beseitigung bestehender Nachteile hin. https://www.gesetze-im-internet.de/gg/art_3.html
[10] Art. 3 Abs. 3 S. 1 GG: Niemand darf wegen des Geschlechts benachteiligt werden. https://www.gesetze-im-internet.de/gg/art_3.html
[11] BVerfG, Beschl. v. 6.12.2005 – 1 BvR 347/98: Leistungsrecht der GKV ist an Art. 2 Abs. 1 GG i. V. m. Sozialstaatsprinzip und Art. 2 Abs. 2 GG zu messen (Anlass: lebensbedrohliche Erkrankung). https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2005/12/rs20051206_1bvr034798.html
[12] Art. 12 CEDAW: UN-Frauenrechtskonvention: Beseitigung der Diskriminierung von Frauen im Gesundheitswesen. https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-elimination-all-forms-discrimination-against-women
[13] Art. 12 UN-Sozialpakt: Recht auf das erreichbare Höchstmaß an körperlicher und geistiger Gesundheit. https://www.ohchr.org/en/instruments-mechanisms/instruments/international-covenant-economic-social-and-cultural-rights
```

## Widerspruch: MRT abgelehnt

**Muster:** Bildgebende Diagnostik als nicht notwendig abgelehnt.

**Prüfung:** alle Erwartungen erfüllt

```text
Fall D
Weg 4
01067 Dresden

Beispiel-IKK
Str. 5
01068 Dresden

Ihr Zeichen: MRT-9
Versichertennr.: B000000004
Datum: 27.09.2026

Widerspruch gegen Ihren Bescheid vom 20.08.2026

Sehr geehrte Damen und Herren,

hiermit lege ich gegen Ihren Bescheid vom 20.08.2026 (Az. MRT-9) Widerspruch ein (§ 84 Abs. 1 SGG). Ich beantrage, den Bescheid aufzuheben und mir folgende Leistung zu bewilligen: MRT des Beckens.

Zur Begründung beantrage ich zunächst Akteneinsicht (§ 25 SGB X), insbesondere die Übersendung einer Kopie aller Gutachten und Stellungnahmen des Medizinischen Dienstes, auf die Sie Ihre Entscheidung stützen.

Begründung

Sie begründen die Ablehnung wie folgt: „Medizinisch nicht notwendig“. Diese Begründung trägt die Entscheidung aus den folgenden Gründen nicht.

Ich leide seit 2019 unter folgenden Beschwerden:
  – Starke Regelschmerzen
  – Schmerzen beim Stuhlgang, v. a. rund um die Periode
  – Blut im Urin während der Periode

Die Regelschmerzen erreichen auf der Schmerzskala (0–10) einen Wert von 9.

Damit bestehen die Beschwerden seit rund 7 Jahren, ohne dass eine gezielte Abklärung auf Endometriose erfolgt ist.

Ich habe Anspruch auf Krankenbehandlung, die notwendig ist, um eine Krankheit zu erkennen (§ 27 Abs. 1 SGB V), und zwar nach dem allgemein anerkannten Stand der medizinischen Erkenntnisse (§ 2 Abs. 1 S. 3 SGB V).

Nach dem allgemein anerkannten Stand der medizinischen Erkenntnisse sind diese Beschwerden ein ausdrücklicher Anlass, an Endometriose zu denken und gezielt abzuklären (NICE NG73; ESHRE-Leitlinie Endometriose 2022; AWMF S2k-Leitlinie Endometriose (Reg.-Nr. 015-045)). Die Leitlinien sehen hierfür insbesondere eine gynäkologische Untersuchung, eine spezialisierte transvaginale Sonographie, gegebenenfalls eine MRT sowie – wo angezeigt – eine Laparoskopie mit histologischer Sicherung vor. Endometriose betrifft rund jede zehnte Frau im reproduktiven Alter (WHO-Faktenblatt Endometriose; Zondervan et al., NEJM 2020). Die bloße Einordnung als „normale Regelschmerzen“ entspricht diesem Standard nicht.

Die Diagnose von Endometriose verzögert sich im deutschsprachigen Raum im Durchschnitt um viele Jahre; Studien zeigen, dass die Beschwerden dabei häufig normalisiert oder bagatellisiert werden (Hudelist et al., Hum Reprod 2012; Ballard et al., Fertil Steril 2006). Die Erkrankung mindert Lebensqualität und Arbeitsfähigkeit erheblich (Nnoaham et al., Fertil Steril 2011). Eine frühzeitige, gezielte Diagnostik ist daher nicht nur medizinisch geboten, sondern auch im Sinne des Wirtschaftlichkeitsgebots (§ 12 Abs. 1 SGB V) sinnvoller als jahrelange ergebnislose Einzelbehandlungen.

Ich weise darauf hin, dass die Leistungsgewährung der gesetzlichen Krankenversicherung an meinem Grundrecht auf körperliche Unversehrtheit (Art. 2 Abs. 2 S. 1 GG) und am Gleichberechtigungsgebot (Art. 3 Abs. 2 GG, Art. 3 Abs. 3 S. 1 GG) zu messen ist (vgl. BVerfG, Beschl. v. 6.12.2005 – 1 BvR 347/98). Auch die UN-Frauenrechtskonvention verpflichtet Deutschland, Diskriminierung von Frauen im Gesundheitswesen zu beseitigen (Art. 12 CEDAW); der UN-Sozialpakt garantiert das erreichbare Höchstmaß an Gesundheit (Art. 12 UN-Sozialpakt).

Bitte bestätigen Sie mir den Eingang dieses Widerspruchs schriftlich.

Mit freundlichen Grüßen


Fall D

Quellen:
[1] § 84 Abs. 1 SGG: Widerspruch binnen eines Monats nach Bekanntgabe. https://www.gesetze-im-internet.de/sgg/__84.html
[2] § 25 SGB X: Akteneinsicht im Verwaltungsverfahren. https://www.gesetze-im-internet.de/sgb_10/__25.html
[3] § 2 Abs. 1 S. 3 SGB V: Leistungen müssen dem allgemein anerkannten Stand der medizinischen Erkenntnisse entsprechen. https://www.gesetze-im-internet.de/sgb_5/__2.html
[4] § 27 Abs. 1 SGB V: Anspruch auf Krankenbehandlung (Krankheit erkennen, heilen, Verschlimmerung verhüten, Beschwerden lindern). https://www.gesetze-im-internet.de/sgb_5/__27.html
[5] NICE NG73: Endometriosis: diagnosis and management (UK National Institute for Health and Care Excellence). https://www.nice.org.uk/guidance/ng73
[6] ESHRE-Leitlinie Endometriose 2022: Becker CM et al. ESHRE guideline: endometriosis. Hum Reprod Open 2022;2022(2):hoac009. DOI: 10.1093/hropen/hoac009 – https://doi.org/10.1093/hropen/hoac009
[7] AWMF S2k-Leitlinie Endometriose (Reg.-Nr. 015-045): Diagnostik und Therapie der Endometriose – DGGG, SGGG, OEGGG. https://register.awmf.org/de/leitlinien/detail/015-045
[8] WHO-Faktenblatt Endometriose: Rund 10 % der Frauen und Mädchen im reproduktiven Alter sind betroffen. https://www.who.int/news-room/fact-sheets/detail/endometriosis
[9] Zondervan et al., NEJM 2020: Zondervan KT, Becker CM, Missmer SA. Endometriosis. N Engl J Med 2020;382:1244–1256. DOI: 10.1056/NEJMra1810764 – https://doi.org/10.1056/NEJMra1810764
[10] Hudelist et al., Hum Reprod 2012: Diagnostic delay for endometriosis in Austria and Germany: causes and possible consequences. Hum Reprod 2012;27(12):3412–3416. DOI: 10.1093/humrep/des316 – https://doi.org/10.1093/humrep/des316
[11] Ballard et al., Fertil Steril 2006: What’s the delay? A qualitative study of women’s experiences of reaching a diagnosis of endometriosis. Fertil Steril 2006;86(5):1296–1301. DOI: 10.1016/j.fertnstert.2006.04.057 – https://doi.org/10.1016/j.fertnstert.2006.04.057
[12] Nnoaham et al., Fertil Steril 2011: Impact of endometriosis on quality of life and work productivity: a multicenter study across ten countries. Fertil Steril 2011;96(2):366–373. DOI: 10.1016/j.fertnstert.2011.05.090 – https://doi.org/10.1016/j.fertnstert.2011.05.090
[13] § 12 Abs. 1 SGB V: Wirtschaftlichkeitsgebot: ausreichend, zweckmäßig, wirtschaftlich. https://www.gesetze-im-internet.de/sgb_5/__12.html
[14] Art. 2 Abs. 2 S. 1 GG: Recht auf Leben und körperliche Unversehrtheit. https://www.gesetze-im-internet.de/gg/art_2.html
[15] Art. 3 Abs. 2 GG: Gleichberechtigung; Staat wirkt auf Beseitigung bestehender Nachteile hin. https://www.gesetze-im-internet.de/gg/art_3.html
[16] Art. 3 Abs. 3 S. 1 GG: Niemand darf wegen des Geschlechts benachteiligt werden. https://www.gesetze-im-internet.de/gg/art_3.html
[17] BVerfG, Beschl. v. 6.12.2005 – 1 BvR 347/98: Leistungsrecht der GKV ist an Art. 2 Abs. 1 GG i. V. m. Sozialstaatsprinzip und Art. 2 Abs. 2 GG zu messen (Anlass: lebensbedrohliche Erkrankung). https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2005/12/rs20051206_1bvr034798.html
[18] Art. 12 CEDAW: UN-Frauenrechtskonvention: Beseitigung der Diskriminierung von Frauen im Gesundheitswesen. https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-elimination-all-forms-discrimination-against-women
[19] Art. 12 UN-Sozialpakt: Recht auf das erreichbare Höchstmaß an körperlicher und geistiger Gesundheit. https://www.ohchr.org/en/instruments-mechanisms/instruments/international-covenant-economic-social-and-cultural-rights
```

## Jugendliche: Schulausfälle, „nimm halt die Pille“

**Muster:** Jugendliche mit Fehltagen in der Schule; Beschwerden werden mit Pille ohne Abklärung abgetan.

**Prüfung:** alle Erwartungen erfüllt

```text
Fall E
Weg 5
70174 Stuttgart

Hausarztpraxis Beispiel
Str. 6
70173 Stuttgart

Geburtsdatum: 15.01.2010
Datum: 27.09.2026

Bitte um Überweisung zur Endometriose-Abklärung

Sehr geehrte Damen und Herren,

ich bin bei Ihnen in Behandlung und möchte meine Beschwerden noch einmal schriftlich zusammenfassen.

Ich leide seit 2023 unter folgenden Beschwerden:
  – Starke Regelschmerzen
  – Übelkeit, Erbrechen oder Kreislaufprobleme während der Periode
  – Ausstrahlende Rücken- oder Beinschmerzen

Die Regelschmerzen erreichen auf der Schmerzskala (0–10) einen Wert von 9. Die Schmerzen hindern mich regelmäßig an der Teilnahme an Arbeit bzw. Ausbildung und Alltag. Ich falle deswegen ca. 2 Tage pro Monat aus. Hormonelle Behandlung (Pille): nur teilweise wirksam.

Damit bestehen die Beschwerden seit rund 3 Jahren, ohne dass eine gezielte Abklärung auf Endometriose erfolgt ist.

Nach dem allgemein anerkannten Stand der medizinischen Erkenntnisse sind diese Beschwerden ein ausdrücklicher Anlass, an Endometriose zu denken und gezielt abzuklären (NICE NG73; ESHRE-Leitlinie Endometriose 2022; AWMF S2k-Leitlinie Endometriose (Reg.-Nr. 015-045)). Die Leitlinien sehen hierfür insbesondere eine gynäkologische Untersuchung, eine spezialisierte transvaginale Sonographie, gegebenenfalls eine MRT sowie – wo angezeigt – eine Laparoskopie mit histologischer Sicherung vor. Endometriose betrifft rund jede zehnte Frau im reproduktiven Alter (WHO-Faktenblatt Endometriose; Zondervan et al., NEJM 2020). Die bloße Einordnung als „normale Regelschmerzen“ entspricht diesem Standard nicht.

Ich bitte Sie daher um eine Überweisung an ein zertifiziertes Endometriosezentrum bzw. eine auf Endometriose spezialisierte gynäkologische Einrichtung, gerne mit Dringlichkeitskennzeichnung für die Terminservicestelle (§ 75 Abs. 1a SGB V).

Falls Sie eine weitere Abklärung für nicht erforderlich halten, bitte ich Sie, mir die medizinischen Gründe hierfür zu erläutern (§ 630c Abs. 2 BGB) und Ihre Entscheidung samt Begründung in meiner Patientenakte zu dokumentieren (§ 630f BGB). Ich behalte mir vor, eine Kopie meiner Patientenakte anzufordern (§ 630g BGB).

Mit freundlichen Grüßen


Fall E

Quellen:
[1] NICE NG73: Endometriosis: diagnosis and management (UK National Institute for Health and Care Excellence). https://www.nice.org.uk/guidance/ng73
[2] ESHRE-Leitlinie Endometriose 2022: Becker CM et al. ESHRE guideline: endometriosis. Hum Reprod Open 2022;2022(2):hoac009. DOI: 10.1093/hropen/hoac009 – https://doi.org/10.1093/hropen/hoac009
[3] AWMF S2k-Leitlinie Endometriose (Reg.-Nr. 015-045): Diagnostik und Therapie der Endometriose – DGGG, SGGG, OEGGG. https://register.awmf.org/de/leitlinien/detail/015-045
[4] WHO-Faktenblatt Endometriose: Rund 10 % der Frauen und Mädchen im reproduktiven Alter sind betroffen. https://www.who.int/news-room/fact-sheets/detail/endometriosis
[5] Zondervan et al., NEJM 2020: Zondervan KT, Becker CM, Missmer SA. Endometriosis. N Engl J Med 2020;382:1244–1256. DOI: 10.1056/NEJMra1810764 – https://doi.org/10.1056/NEJMra1810764
[6] § 75 Abs. 1a SGB V: Terminservicestellen: Facharzttermin innerhalb von vier Wochen. https://www.gesetze-im-internet.de/sgb_5/__75.html
[7] § 630c Abs. 2 BGB: Informationspflicht der Behandelnden. https://www.gesetze-im-internet.de/bgb/__630c.html
[8] § 630f BGB: Dokumentationspflicht der Behandelnden. https://www.gesetze-im-internet.de/bgb/__630f.html
[9] § 630g BGB: Recht auf Einsicht in die Patientenakte und Abschriften. https://www.gesetze-im-internet.de/bgb/__630g.html
```
