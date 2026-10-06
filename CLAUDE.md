# FightEndo

FightEndo is an offline app for people with endometriosis. Users record symptoms, doctor visits and dismissive comments. The app turns these into well-referenced letters to the health insurer (Krankenkasse), citing laws, case law and studies with DOIs.

It is a vanilla-JS PWA with no build step and no dependencies. Capacitor 8 wraps it for Android and iOS. The project is GPL-3.0 and open source, so people in other countries can add their own law and language. `README.md` and `CONTRIBUTING.md` describe the project for contributors.

## Non-negotiables

The users are patients writing about sensitive health data, often to an insurer that has already refused them. Every change has to keep these properties:

- **No network, ever.**
  - The Content-Security-Policy in `index.html` sets `connect-src 'none'`.
  - The Android manifest has no `INTERNET` permission.
  - `sw.js` only caches the app's own files.
  - Do not add analytics, CDNs, fonts or remote images.
  - A feature that needs the network is a decision for the user, not an implementation detail.
- **Data stays on the device.**
  - Everything lives in localStorage. It can optionally be encrypted with AES-256-GCM and a PBKDF2-SHA-256 key (600 000 iterations), implemented in `js/core.js`.
  - Android sets `allowBackup=false`, and release builds set `FLAG_SECURE` (see `MainActivity.java`).
  - iOS shows a privacy cover when the app goes to the background (`SceneDelegate.swift`).
- **The app is not legal advice.** The letters help users assert their own rights, and the wording stays on that side of the line. `docs/app-stores.md` explains why (Apple 5.1.1(ix), BGH I ZR 113/20 "Smartlaw").
- **Every legal or medical claim in a letter cites a source** from the jurisdiction's `sources`. A study needs a DOI. `FE.buildLetter` appends the numbered "Quellen" list automatically.

## Where things are

- **`js/core.js`**: state, sanitising (`FE.sanitize` drops implausible values), encryption, the jurisdiction registry and `FE.buildLetter`.
- **`js/app.js`**: the UI. Other files in `js/`:
  - `js/pdf.js`: a hand-written PDF writer for DIN 5008 letters.
  - `js/signature.js`: signature photo cropping and placement.
  - `js/native.js`: the Capacitor bridge for saving and sharing.
- **`jurisdictions/<iso>/index.js`**: one plug-in per country, registered with `FightEndo.registerJurisdiction`.
  - `de` is the complete worked example. `_template` is what `npm run new` copies.
  - The contract (sources, letters, `build(ctx)` returning a DIN object `{sender, recipient, info, subject, body}` or a string, `closing`, `sendingTips`) is documented in `CONTRIBUTING.md`.
- **`i18n/de.js`, `i18n/en.js`**: UI strings. The keys must match across languages; `npm run check` enforces this.
- **Tests:**
  - `tests/selftest.html`: the in-browser self-test.
  - `tests/cases/cases.json`: anonymised composite cases. `npm run eval` regenerates `docs/evaluation.md` from them.
  - `tests/fixtures/sample-state.json`: sample data.
- **Assets and docs:**
  - `assets/`: icon and splash sources plus store graphics, rendered by `npm run assets`.
  - `social/`: the Instagram slides.
  - `docs/`: store paperwork and the evaluation.
- **Native and build output:**
  - `android/`, `ios/`: the Capacitor projects.
  - `www/`: build output from `npm run build:web`. It is git-ignored; never edit it.

## Commands

- `npm start` serves the app at http://localhost:5200. The `fightendo` entry in `Desktop\.claude\launch.json` does the same for the preview pane.
- `npm run check` must pass before any change counts as done. It runs `sync --check`, `validate` and `stress`; the stress run tries every option combination and checks every PDF's xref table.
- `npm test` runs the self-test in headless Chrome or Edge over CDP and needs Node 22+.
  - `tests/selftest.html` sets the locale to `de` explicitly, because the emulator and CI default to en-US.
  - On Windows it kills the browser with `taskkill /T`, because stale browsers keep the debug port open.
- `npm run sync` registers every language and country. It rewrites the generated blocks: `BEGIN:modules` in `index.html` and `BEGIN:files` in `sw.js`. Never hand-edit those blocks.
- `npm run native:sync` builds `www/` and runs `cap sync`.
  - Android needs JDK 21 at `C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot`.
  - `android/app/build.gradle` reads `VERSION_CODE`/`VERSION_NAME` and the signing settings from environment variables.
  - iOS builds only on GitHub Actions (`.github/workflows/ios.yml`).

## Conventions

- **Fix generated output at its source.** When a generated file is out of date, run the generator; don't patch the output.
- **Write throwaway transform scripts to files in the scratchpad**, using `String.raw` where backslashes matter. Shell-quoted `node -e` or `sed` one-liners have repeatedly mangled backslashes and newlines in this codebase.
- **Phone layout:**
  - Below 720px wide, a bottom nav bar replaces the top tabs, and the language picker moves under "Mehr".
  - `body` reserves `padding-bottom` for the bar, except while the user is typing or the app is locked.
  - The text-size setting sets CSS `zoom` on the root element from `js/app.js` (0.9 to 1.5).
  - When changing CSS, check at 320px wide with 150% text and confirm nothing overflows or sits under the bar. The self-test measures the last text line against the bar.
- **The web version gets extra guidance the app doesn't need**, gated on `!isNative()` in `js/app.js`: a first-visit note (seen-flag `fightendo.webinfo`), a backup reminder (every 14 days once there is data, using `settings.lastBackup`), and the web-only sections of the help page (`#help`).
- **Test phase:** the site runs unlisted. `index.html`, `privacy.html` and `impressum.html` carry `<meta name="robots" content="noindex, nofollow">`; remove it from all three at launch. The `[placeholders]` in `impressum.html` stay during the test phase (the user's decision) and must be filled in before launch.
- **Test against real behaviour:**
  - Check the encryption with real ciphertext in the browser, not by reading the code.
  - Check layout on a real or emulated device.
  - A new self-test should fail on the old code before it counts as a regression test.
- **Show user-facing text for review before it ships.** This covers the README, store texts, letters and outreach emails. Nothing is committed or released without the user's go-ahead.
