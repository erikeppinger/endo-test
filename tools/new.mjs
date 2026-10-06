// Scaffold a new country or language, then register it.
//   npm run new -- country at "Österreich (ÖGK)" de
//   npm run new -- language fr "Français"
// SPDX-License-Identifier: GPL-3.0-or-later
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, sync } from './sync.mjs';

const [kind, code, name, language] = process.argv.slice(2);
const usage = () => {
  console.log('Usage:\n  npm run new -- country <iso-code> "<Name>" <letter-language>\n  npm run new -- language <iso-code> "<Own name of the language>"');
  process.exit(1);
};
if (!kind || !code || !name || !/^[a-z]{2,3}(-[a-z]{2,4})?$/.test(code)) usage();

if (kind === 'country') {
  const dir = join(ROOT, 'jurisdictions', code);
  if (existsSync(dir)) { console.error('✗ jurisdictions/' + code + ' already exists'); process.exit(1); }
  const lang = language || 'en';
  let src = readFileSync(join(ROOT, 'jurisdictions/_template/index.js'), 'utf8');
  src = src.replace("id: 'xx'", "id: '" + code + "'")
    .replace("name: 'Country (health system)'", 'name: ' + JSON.stringify(name))
    .replace("language: 'en'", "language: '" + lang + "'")
    .replace("lastReviewed: 'YYYY-MM'", "lastReviewed: '" + new Date().toISOString().slice(0, 7) + "'");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.js'), src);
  console.log('✓ Created jurisdictions/' + code + '/index.js');
  if (!existsSync(join(ROOT, 'i18n', lang + '.js'))) console.log('! i18n/' + lang + '.js does not exist yet – run: npm run new -- language ' + lang + ' "<Name>"');
} else if (kind === 'language') {
  const file = join(ROOT, 'i18n', code + '.js');
  if (existsSync(file)) { console.error('✗ i18n/' + code + '.js already exists'); process.exit(1); }
  let src = readFileSync(join(ROOT, 'i18n/en.js'), 'utf8');
  src = src.replace(/^\/\*[\s\S]*?\*\//, '/* FightEndo – ' + name + ' UI strings. SPDX-License-Identifier: GPL-3.0-or-later\n * Copied from English: translate every value, keep the keys and {placeholders}. */')
    .replace("registerLocale('en'", "registerLocale('" + code + "'")
    .replace("'lang.name': 'English'", "'lang.name': " + JSON.stringify(name));
  writeFileSync(file, src);
  console.log('✓ Created i18n/' + code + '.js (English copy – translate the values)');
} else usage();

sync(false);
console.log('✓ Registered in index.html and sw.js. Next: edit the file, then run `npm run check` and `npm test`.');
