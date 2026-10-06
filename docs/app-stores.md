# FightEndo in den App-Stores – Leitfaden

Stand: September 2026. Die Store-Regeln ändern sich regelmäßig. Prüfe deshalb vor der Einreichung die aktuellen Richtlinien bei Apple und Google.

## Überblick

Eine Codebasis ergibt drei Wege zu den Nutzer*innen:

| Weg | Technik | Kosten | Prüfung |
|---|---|---|---|
| **Web-App (PWA)** | GitHub Pages, installierbar über „Zum Startbildschirm“ | kostenlos | keine |
| **Android** (Google Play) | Capacitor → `android/`, CI baut die AAB | einmalig 25 US$ | Google-Review |
| **iPhone/iPad** (App Store) | Capacitor → `ios/`, CI baut auf einem macOS-Runner | 99 US$/Jahr (Gebührenbefreiung für gemeinnützige Organisationen möglich) | Apple-Review |

Ein iOS-Build ist über GitHub möglich, ganz ohne eigenen Mac (`.github/workflows/ios.yml`):
- Bei jedem Push wird für den Simulator kompiliert. Dafür braucht es kein Apple-Konto.
- Bei einem Tag `v1.2.3` wird die App signiert und zu TestFlight hochgeladen. Dafür braucht es ein Apple-Developer-Konto und vier Secrets (siehe Workflow-Datei).

## Vor der Einreichung klären (wichtig)

1. **Wer veröffentlicht?**
   - **Was Apple verlangt:** Nach Richtlinie 5.1.1(ix) sollen Apps, die in stark regulierten Bereichen wie dem Gesundheitswesen *Leistungen erbringen* oder sensible Daten verlangen, von einer juristischen Person eingereicht werden.
   - **Ist FightEndo „Beratung“?** Nach unserer Einschätzung nicht:
     - *Medizinisch:* Die App stellt keine Diagnose, empfiehlt keine Behandlung und bewertet keinen Einzelfall. Sie dokumentiert und formuliert.
     - *Rechtlich:* Der BGH hat entschieden, dass ein Dokumentengenerator, der aus Antworten Textbausteine zusammensetzt, **keine Rechtsdienstleistung** im Sinne des RDG ist (BGH, Urt. v. 09.09.2021 – I ZR 113/20, „Smartlaw“). FightEndo arbeitet genauso und ist zudem kostenlos.
     - *Daten:* Die App erhebt keine sensiblen Daten. Alles bleibt auf dem Gerät, nichts erreicht die Entwickler.
   - **Risiko:** Die Store-Prüfung bewertet das trotzdem ermessensabhängig. Ein Gesundheitsthema kann ein Prüfer als „healthcare“ einordnen.
   - **Empfehlung:**
     - Den Store-Text strikt als *Dokumentations- und Schreibwerkzeug* formulieren. Kategorie „Productivity“ oder „Reference“ statt „Medical“, oder „Medical“ nur mit klarer Zweckbestimmung.
     - In den Review-Notes auf lokal, keine Diagnose und keine Rechtsberatung hinweisen (Smartlaw).
     - Eine Einreichung als Einzelperson ist möglich. Wird abgelehnt, kann man widersprechen oder auf ein Organisationskonto wechseln (Verein, gGmbH oder Partnerorganisation wie die Endometriose-Vereinigung Deutschland e. V.). Ein Organisationskonto braucht eine D-U-N-S-Nummer (kostenlos).
2. **Sichtbarkeit deines Namens.** Bei einem Einzelkonto zeigt Apple deinen bürgerlichen Namen als Anbieter an. Unter dem EU-Digital-Services-Act musst du dich als „Trader“ oder „Non-Trader“ einstufen. Trader müssen Anschrift, Telefon und E-Mail öffentlich angeben. Ein kostenloses, werbefreies Open-Source-Projekt ohne Einnahmen ist in der Regel „Non-Trader“. Das ist deine Entscheidung, sie lässt sich aber nicht leicht rückgängig machen.
3. **Medizinprodukt? (EU-MDR)** FightEndo diagnostiziert nicht, sondern dokumentiert und formuliert Briefe. Die Zweckbestimmung muss das überall klar sagen: in der App, im Store-Text und auf der Webseite. Bewirb die App nie als „Endometriose-Test“ oder „erkennt Endometriose“. Die Einordnung als Leitlinien-Symptom ist ein Argument für eine Untersuchung und keine Diagnose. Lass das vor dem Start kurz von einer Fachperson für Medizinprodukterecht prüfen.
4. **Rechtliche Inhalte** der Briefe von einer Fachperson für Sozialrecht prüfen lassen (siehe README).
5. **Name und Marke:** Recherche in TMview und DPMAregister (Klassen 9 und 44), Domain und Social-Handles sichern.
6. **App-ID festlegen:** `org.fightendo.app` in `capacitor.config.json`. Sie ist nach der ersten Veröffentlichung **nicht mehr änderbar**. Wenn dir eine Domain gehört, nimm deren Umkehrung, zum Beispiel `de.deinverein.fightendo`.

## Google Play – Schritt für Schritt

1. Play-Console-Konto anlegen (25 US$). Konten für Privatpersonen müssen vor dem ersten Produktiv-Release einen **geschlossenen Test mit mindestens 12 Tester*innen über 14 Tage** durchführen. Das lässt sich gut mit der Selbsthilfe-Community organisieren.
2. Upload-Schlüssel einmalig erzeugen und sicher aufbewahren (nicht ins Repo):
   ```bash
   keytool -genkeypair -v -keystore fightendo-upload.jks -alias upload -keyalg RSA -keysize 4096 -validity 10000
   ```
   Base64 davon als Secret `ANDROID_KEYSTORE_BASE64` hinterlegen, dazu die drei Passwort- und Alias-Secrets. In der Play Console **Play App Signing** aktivieren.
3. Einen Tag `v0.2.0` pushen. Der Workflow „Android“ baut die signierte `.aab`, die du dann in der Play Console hochlädst.
4. **App-Inhalte** ausfüllen (die Antworten stehen in [store-listing.md](store-listing.md)):
   - Datenschutzerklärung: `https://<user>.github.io/fightendo/privacy.html`
   - **Datensicherheit:** Es werden keine Daten erhoben und keine Daten geteilt. Die App hat keine INTERNET-Berechtigung, das ist im Manifest nachprüfbar.
   - **Gesundheits-App-Erklärung:** Kategorie „Gesundheit & Fitness / medizinische Informationen“, kein Medizinprodukt, Haftungsausschluss vorhanden.
   - Werbung: nein. App-Zugriff: keine Anmeldung nötig.
   - Einstufung des Inhalts (IARC-Fragebogen): medizinische Informationen, keine Gewalt und keine Käufe.
   - Zielgruppe: 16+ oder 18+ wählen. So gilt die Familien-Richtlinie nicht, während Jugendliche die App über die Web-Version trotzdem nutzen können.
5. Store-Eintrag: Texte, Icon 512 × 512, Feature-Grafik 1024 × 500 und Screenshots liegen fertig in `assets/store/`.

## Apple App Store – Schritt für Schritt

1. Apple Developer Program beitreten (Organisation empfohlen, siehe oben).
2. In App Store Connect die App anlegen: Bundle-ID `org.fightendo.app`, Primärsprache Deutsch.
3. Unter Integrationen → App Store Connect API einen Schlüssel anlegen (Rolle „App Manager“). Team-ID, Key-ID, Issuer-ID und den Inhalt der `.p8`-Datei (Base64) als GitHub-Secrets hinterlegen.
4. Einen Tag `v0.2.0` pushen. Der Workflow „iOS“ archiviert, signiert (Xcode legt Zertifikate automatisch an) und lädt den Build zu TestFlight hoch.
5. **App-Datenschutz** („Nutrition Label“): **Keine Daten erfasst.** Ein Datenschutz-Manifest (`ios/App/App/PrivacyInfo.xcprivacy`) liegt bei, ebenso `ITSAppUsesNonExemptEncryption = false`. Die lokale AES-Verschlüsselung dient ausschließlich dem Datenschutz und nutzt die Kryptografie des Systems. Damit ist sie von der Exportmeldung ausgenommen.
6. **Review-Hinweise** (Feld „Notes“), am besten auf Englisch:
   > FightEndo is a documentation and letter-writing tool. It works fully offline and has no login, no server and no network access; no user data ever reaches the developers. It helps patients document symptoms and doctor visits and assembles letters to their health insurer from templates that cite laws and published guidelines. It does not diagnose, recommend treatment or give individual legal advice, and it is not a medical device; this is stated in the app and in the description. Under German case law, template-based document generators are not legal services (Federal Court of Justice, I ZR 113/20). To test: tap “Symptoms”, tick a few boxes, then open “Letter” and choose a template.
7. **Risiko Richtlinie 4.2 (Minimalfunktionalität):** Reine Webseiten-Hüllen lehnt Apple ab. FightEndo läuft komplett offline, nutzt das native Teilen-Menü, erzeugt PDFs, kann unterschreiben und verschlüsselt lokal. Diese Funktionen gehören in die Beschreibung und die Screenshots.
8. Altersfreigabe: Den Fragebogen ehrlich ausfüllen („medizinische Informationen“).

## Schutz der Nutzer*innen – was technisch umgesetzt ist

| Maßnahme | Android | iOS | Web |
|---|---|---|---|
| Keine Netzwerkverbindung | keine INTERNET-Berechtigung und CSP `connect-src 'none'` | CSP | CSP |
| Andere Apps können nichts lesen | App-Sandbox | App-Sandbox | Browser-Origin |
| Optionale Verschlüsselung (AES-256-GCM, PBKDF2 600k) mit Auto-Sperre | ✓ | ✓ | ✓ |
| Keine Cloud-Backups der App-Daten | `allowBackup=false` | nur verschlüsselt (App-Sperre empfohlen) | – |
| Kein Screenshot / keine Vorschau im App-Umschalter | FLAG_SECURE | Abdeckung beim Wechsel | – |
| Temporäre PDFs werden gelöscht | beim Start und beim Sperren | beim Start und beim Sperren | – |
| Keine Protokollierung von Inhalten | `loggingBehavior: none` | dito | – |

Grenzen, die offen kommuniziert werden sollten:
- Wer das entsperrte Gerät in der Hand hat, sieht bei ausgeschalteter App-Sperre die Daten.
- In der Web-Version können Browser-Erweiterungen den Speicher lesen, solange die App-Sperre aus ist.
- Einmal geteilte oder ausgedruckte Briefe liegen außerhalb der App.

## Checkliste vor dem ersten Release

- [ ] Rechtliche Prüfung der deutschen Briefe
- [ ] MDR-Einordnung bestätigt
- [ ] Veröffentlichende Stelle geklärt (Einzelperson, Verein oder Partnerorganisation)
- [ ] App-ID endgültig festgelegt
- [ ] Datenschutzerklärung: Verantwortliche*n eintragen, auf GitHub Pages online
- [ ] Markenrecherche erledigt
- [ ] Geschlossener Test (Android: 12 Tester*innen, 14 Tage), TestFlight-Test (iOS)
- [ ] Screenshots neu erzeugen: `npm run screenshots`
