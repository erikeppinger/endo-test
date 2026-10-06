// Copies the web app into www/ – the folder Capacitor packages into the Android/iOS apps.
// Only app files are copied (no tests, tools, docs or templates).
// SPDX-License-Identifier: GPL-3.0-or-later
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, sync, modules } from './sync.mjs';

sync(false);
const out = join(ROOT, 'www');
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
const { locales, countries } = modules();
const files = ['index.html', 'sw.js', 'manifest.webmanifest', 'css/app.css', 'js/core.js', 'js/pdf.js', 'js/app.js', 'js/native.js', 'js/signature.js', 'icons/icon.svg', 'icons/icon-192.webp', 'icons/icon-512.webp', 'privacy.html', 'impressum.html', ...locales, ...countries];
for (const f of files) cpSync(join(ROOT, f), join(out, f), { recursive: true });
console.log('✓ www/ built with ' + files.length + ' files');
