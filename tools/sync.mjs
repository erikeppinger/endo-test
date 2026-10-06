// Registers every language (i18n/*.js) and country (jurisdictions/<id>/index.js)
// in index.html and the offline cache (sw.js). Contributors never edit those by hand.
//   node tools/sync.mjs          rewrite the generated blocks
//   node tools/sync.mjs --check  exit 1 if they are out of date (used in CI)
// SPDX-License-Identifier: GPL-3.0-or-later
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

export function modules() {
  const locales = readdirSync(join(ROOT, 'i18n')).filter((f) => f.endsWith('.js')).sort()
    .map((f) => 'i18n/' + f);
  const countries = readdirSync(join(ROOT, 'jurisdictions'))
    .filter((d) => !d.startsWith('_') && statSync(join(ROOT, 'jurisdictions', d)).isDirectory())
    .filter((d) => existsSync(join(ROOT, 'jurisdictions', d, 'index.js')))
    .sort()
    .map((d) => 'jurisdictions/' + d + '/index.js');
  return { locales, countries };
}

const STATIC = ['index.html', 'privacy.html', 'impressum.html', 'css/app.css', 'js/core.js', 'js/pdf.js', 'js/native.js', 'js/signature.js', 'js/app.js', 'icons/icon.svg', 'icons/icon-192.webp', 'icons/icon-512.webp', 'manifest.webmanifest'];

function replaceBlock(text, begin, end, body, file) {
  const a = text.indexOf(begin);
  const b = text.indexOf(end);
  if (a < 0 || b < 0) throw new Error(file + ': markers "' + begin + '" / "' + end + '" not found');
  const lineStart = text.indexOf('\n', a) + 1;
  const endLineStart = text.lastIndexOf('\n', b) + 1;
  return text.slice(0, lineStart) + body + text.slice(endLineStart);
}

export function sync(onlyCheck) {
  const { locales, countries } = modules();
  const scripts = [...locales, ...countries];
  let changed = [];

  const htmlPath = join(ROOT, 'index.html');
  const html = readFileSync(htmlPath, 'utf8');
  const newHtml = replaceBlock(html, '<!-- BEGIN:modules', '<!-- END:modules',
    scripts.map((s) => '  <script src="' + s + '"></script>\n').join(''), 'index.html');
  if (newHtml !== html) { changed.push('index.html'); if (!onlyCheck) writeFileSync(htmlPath, newHtml); }

  // Cache name = hash of all app files, so every change reaches installed apps.
  const files = [...STATIC, ...scripts];
  const hash = createHash('sha256');
  for (const f of files) hash.update(f).update(f === 'index.html' ? newHtml : readFileSync(join(ROOT, f)));
  const swPath = join(ROOT, 'sw.js');
  const sw = readFileSync(swPath, 'utf8');
  const body = "const CACHE = 'fightendo-" + hash.digest('hex').slice(0, 10) + "';\n" +
    'const FILES = [\n' + ['./', ...files.map((f) => './' + f)].map((f) => "  '" + f + "'").join(',\n') + '\n];\n';
  const newSw = replaceBlock(sw, '// BEGIN:files', '// END:files', body, 'sw.js');
  if (newSw !== sw) { changed.push('sw.js'); if (!onlyCheck) writeFileSync(swPath, newSw); }
  return { changed, locales, countries };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { changed, locales, countries } = sync(check);
  if (check && changed.length) {
    console.error('✗ Out of date: ' + changed.join(', ') + '. Run `npm run sync` and commit the result.');
    process.exit(1);
  }
  console.log((check ? '✓ In sync' : '✓ Synced') + ' – languages: ' + locales.map((l) => l.slice(5, -3)).join(', ') +
    ' · countries: ' + countries.map((c) => c.split('/')[1]).join(', '));
}
