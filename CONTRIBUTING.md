# Contributing to FightEndo

FightEndo grows one country and one language at a time. Lawyers, patient advocates, doctors, translators and people with endometriosis are all welcome. You don't need to be a programmer.

*Deutsch: Beiträge sind in jeder Sprache willkommen. Issues und Pull Requests auf Deutsch sind völlig in Ordnung.*

## Three ways to help

| You are … | Do this |
|---|---|
| **Not technical** | Open an issue: [Add my country](../../issues/new?template=new-country.yml), [Legal correction](../../issues/new?template=legal-correction.yml) or [Translate](../../issues/new?template=new-language.yml). Someone else turns it into code. |
| **Comfortable editing text files** | Follow the pipeline below. Every step is one command. |
| **A legal expert** | Review pull requests labelled `country`. Your review is what makes a country trustworthy. |

## The pipeline

You need [Node.js](https://nodejs.org) 22 or newer and Git. The checks below need no `npm install`: the web app has no dependencies. Only the native app builds use Capacitor. You can also do everything in the browser with **GitHub Codespaces** (Code → Codespaces → Create).

```bash
# 1. Fork on GitHub, then:
git clone https://github.com/<you>/fightendo && cd fightendo

# 2. Create your country or language (registers it in the app automatically)
npm run new -- country at "Österreich (ÖGK)" de
npm run new -- language fr "Français"

# 3. Edit the new file(s):
#    jurisdictions/at/index.js   – sources, letters, sending tips
#    i18n/fr.js                  – translate the values, keep the keys

# 4. See it running: http://localhost:5200 (pick your country on the start page)
npm start

# 5. Check everything, as CI will
npm run check     # validates your files and tries every letter with sample data
npm test          # clicks through the whole app in headless Chrome

# 6. Commit and open a pull request. The template has a short checklist.
```

### What `npm run check` catches for you

- missing or misspelled translation keys, and `{placeholders}` that don't match
- letters that crash, or produce `undefined` or `NaN` with empty or sample data
- citations of sources that don't exist
- sources without `https://` links, and studies without a DOI (the DOI rule is a warning)
- letters that ignore the user's own addition, and a missing `closing` phrase (needed for the PDF signature)
- `index.html` or `sw.js` not up to date. Fix this with `npm run sync`, and never edit those two files by hand.

## What a country file contains

`jurisdictions/de/index.js` is a complete worked example. `jurisdictions/_template/index.js` is what `npm run new` copies.

- **sources**: laws, fundamental and human rights, case law, guidelines and studies. Each one has a short citation (used in letters), a title and a link.
- **resources**: patient organisations, counselling services and complaint bodies.
- **letters**: each letter has a title, a description, optional fields, options (the tick boxes that switch arguments on and off) and `build(ctx)`. Everything the user enters is in `ctx`, including `ctx.extra` (their own addition) and `ctx.s.notes`. `build` returns a **letter object** `{ sender: [...], recipient: [...], info: [[label, value]...], subject, body }`, which the app lays out as a business letter per DIN 5008 (window envelope, information block, fold marks). It can also return a **string** for documents without addresses, such as the chronology.
- **pageLabel**: page numbering in the country's language, e.g. `'Page {i} of {n}'`.
- **sendingTips**: how to send each letter so it counts legally (post, fax, portal, e-mail, signature).
- **closing**: the exact closing line. The signature is placed after it in the PDF.
- **objectionDeadline** (optional): calculates the appeal deadline from the date of a decision.

Letters are written in the country's language. The UI language is separate: someone in Germany can use the English UI and still get a German letter.

## Rules for legal and medical content

- **Every claim needs a source.** Laws link to the official text, case law gives the court, date and case number, and studies have a DOI.
- **Don't overstate.** If a right only applies in some situations, say so in the letter. An overclaiming letter can hurt the person who sends it.
- **Firm, factual, polite.** Nobody is insulted by name.
- **Review.** A new country is merged after at least one review by someone who knows that legal system. Update `lastReviewed` when you check the content.

## Privacy rules (non-negotiable)

- No network requests, analytics, telemetry, external fonts, CDNs or third-party scripts.
- The Content-Security-Policy in `index.html` stays strict (`connect-src 'none'`).
- No accounts and no cloud sync. Data leaves the device only when the user exports or shares it.

## Code

Plain JavaScript (ES2017+), no build step, no dependencies in the web app. Keep it readable for people who are not professional developers. The native app wrappers (`android/`, `ios/`) are generated by Capacitor, see [docs/app-stores.md](docs/app-stores.md).

## Code of conduct

Be kind. Believe people about their pain.
