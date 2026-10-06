// Renders app icons, splash screens and the Play Store feature graphic from assets/render.html
// with headless Chrome, then lets @capacitor/assets place them into android/ and ios/.
//   npm run assets
// SPDX-License-Identifier: GPL-3.0-or-later
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './sync.mjs';

const browser = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].filter(Boolean).find(existsSync);
if (!browser) { console.error('✗ Chrome not found (set CHROME_PATH)'); process.exit(1); }

const out = join(ROOT, 'assets');
mkdirSync(join(out, 'store'), { recursive: true });
const page = pathToFileURL(join(ROOT, 'assets/render.html')).href;
const jobs = [
  ['icon-only.png', 'icon', 1024, 1024],
  ['icon-foreground.png', 'fg', 1024, 1024],
  ['icon-background.png', 'bg', 1024, 1024],
  ['splash.png', 'splash', 2732, 2732],
  ['splash-dark.png', 'splash', 2732, 2732],
  ['store/play-icon-512.png', 'icon', 512, 512],
  ['store/play-feature-1024x500.png', 'feature', 1024, 500]
];
for (const [file, k, w, h] of jobs) {
  execFileSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--default-background-color=00000000', '--window-size=' + w + ',' + h,
    '--screenshot=' + join(out, file), page + '?k=' + k], { stdio: 'ignore' });
  console.log('✓ assets/' + file);
}
console.log('Next: npx @capacitor/assets generate --iconBackgroundColor "#1d1a2b" --splashBackgroundColor "#1d1a2b"');
