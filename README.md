# FightEndo

**Deine Beschwerden. Deine Rechte. Dein Brief.**

FightEndo hilft Menschen mit Verdacht auf Endometriose dabei,

1. ihre Beschwerden strukturiert zu erfassen (Symptom-Check nach den Leitlinien NICE NG73 und ESHRE 2022, Schmerztagebuch),
2. Arztbesuche, abgelehnte Maßnahmen und Sprüche wie „Regelschmerzen sind normal“ oder „Das ist psychisch“ zu dokumentieren,
3. daraus einen sachlichen, belegten Brief zu erzeugen: an die Krankenkasse, an die Praxis oder als Widerspruch. Der Brief erscheint im Layout nach DIN 5008, passt in einen Fensterumschlag und wird unterschrieben.

Im Schnitt dauert es viele Jahre bis zur Diagnose. Ein Beispiel dafür, was Betroffene erleben:
[taz: Höllische Menstruationsschmerzen](https://taz.de/Hoellische-Menstruationsschmerzen/!6208401/).

## Grundsätze

- **Alles bleibt lokal.** Es gibt keinen Server, kein Konto, keine Analyse und keine Werbung. Die Content-Security-Policy (`connect-src 'none'`) verbietet jede Netzwerkverbindung, und die Android-App hat nicht einmal die INTERNET-Berechtigung.
- **Schutz sensibler Daten.** Eine optionale App-Sperre verschlüsselt alle Daten mit AES-256-GCM (PBKDF2, 600 000 Runden) und sperrt sich automatisch. In den Apps sind Screenshots und die Vorschau im App-Umschalter blockiert, und es gibt keine Cloud-Backups.
- **Offen für alle Länder und Sprachen.** Jede Rechtsordnung ist eine eigene Datei. Neue Länder und Sprachen legt man mit einem Befehl an und prüft sie automatisch, siehe [CONTRIBUTING.md](CONTRIBUTING.md).
- **Keine Diagnose, keine Rechtsberatung.** FightEndo liefert Argumente und Formulierungen. Die Verantwortung für den Brief bleibt bei der Person, die ihn verschickt.

## Funktionen

- **Oberfläche auf Deutsch und Englisch.** Die Sprache richtet sich beim ersten Start nach dem Gerät. Briefe entstehen immer in der Sprache des gewählten Landes.
- **Live-Brief.** Häkchen, Notizen, Name und eigene Ergänzungen fließen sofort in den Text ein. Danach lässt er sich frei bearbeiten.
- **Unterschrift.** Du zeichnest sie, oder du nimmst ein Foto, drehst es, schneidest zu und hellst den Hintergrund auf. Danach platzierst du sie in der Vorschau und stellst Größe und Position ein.
- **Speichern und Versand:**
  - PDF nach DIN 5008.
  - RTF zum Weiterbearbeiten in Word, LibreOffice oder Google Docs.
  - Text, Drucken und Kopieren.
  - Am PC öffnet sich ein „Speichern unter“-Dialog, damit auch Dropbox-, Drive- oder OneDrive-Ordner wählbar sind. Auf dem Handy öffnet sich das Teilen-Menü (Dateien, Drive, Dropbox, E-Mail, App der Krankenkasse).
  - FightEndo lädt nie selbst etwas hoch.
- **Sicherung** als Datei. Bei aktiver App-Sperre ist sie verschlüsselt.

## Benutzen

- **Im Browser:** `index.html` öffnen, oder `npm start` ausführen und dann <http://localhost:5200> aufrufen.
- **Als Web-App:** Die Web-Version wird über GitHub Pages ausgeliefert (`.github/workflows/pages.yml`) und lässt sich über „Zum Startbildschirm hinzufügen“ installieren.
- **Android und iOS:** Die nativen Apps entstehen mit Capacitor. Die Builds laufen über GitHub Actions, auch iOS ohne eigenen Mac. Einzelheiten stehen in [docs/app-stores.md](docs/app-stores.md).

## Was drin ist (Deutschland)

| Vorlage | Zweck |
|---|---|
| Antrag an die Krankenkasse | Beratung, Versorgungsmanagement, Vermittlung an ein Endometriosezentrum und Kostenzusage für leitliniengerechte Diagnostik |
| Widerspruch | gegen einen Ablehnungsbescheid (§ 84 SGG), mit Fristberechnung und Antrag auf Akteneinsicht |
| Brief an die Praxis | Bitte um Überweisung. Lehnt die Praxis ab, soll sie die Gründe erläutern und in der Akte dokumentieren (§§ 630c, 630f BGB) |
| Patientenakte anfordern | § 630g BGB und Art. 15 DSGVO: Die erste Kopie ist kostenlos (EuGH C-307/22) |
| Chronologie | Gedächtnisprotokoll aller Termine, Aussagen und Bescheide als Anlage |

## Befehle

| Befehl | Zweck |
|---|---|
| `npm start` | lokaler Server auf Port 5200 |
| `npm run check` | prüft Sprachen und Länder und probiert jeden Brief mit Beispieldaten durch |
| `npm test` | klickt die ganze App in headless Chrome oder Edge durch (23 Prüfungen) |
| `npm run new -- country at "Österreich (ÖGK)" de` | neues Land anlegen |
| `npm run new -- language fr "Français"` | neue Sprache anlegen |
| `npm run native:sync` | Web-App in die Android- und iOS-Projekte kopieren |
| `npm run assets` / `npm run screenshots` | App-Icons und Store-Screenshots erzeugen |

## Projektstruktur

```
index.html, privacy.html   App und Datenschutzerklärung (strikte CSP)
js/core.js                 Datenmodell, Speicher, Verschlüsselung, Brief-Kontext
js/app.js                  Oberfläche
js/pdf.js                  PDF-Erzeugung offline (DIN 5008)
js/signature.js            Unterschrift zeichnen, per Foto zuschneiden und platzieren
js/native.js               Brücke zu Android und iOS (Teilen-Menü, Aufräumen)
i18n/                      Sprachen der Oberfläche
jurisdictions/<land>/      Rechtsordnungen: Quellen, Briefe, Fristen, Versandhinweise
tools/                     sync, validate, new, selftest, build-web, assets, screenshots
tests/                     Selbsttest und Beispieldaten
android/, ios/             native Projekte (Capacitor)
docs/                      Leitfaden für die App-Stores und Store-Texte
social/                    Slides für Social Media
```

## Lizenz

[GPL-3.0-or-later](LICENSE). Du darfst FightEndo frei nutzen, verändern und weitergeben. Veränderte Versionen müssen ebenfalls frei bleiben. Das Logo (gelbe Schleife) ist eine eigene Zeichnung und steht ebenfalls unter der GPL.
