// Store screenshots in German and English with demo data (headless Chrome, device emulation).
//   npm run screenshots  →  assets/store/screenshots/<lang>/<device>-<n>-<view>.png
// Sizes: iPhone 6.9" slot (1290×2796) and Google Play phone (1080×1920). Needs Node 22+.
// SPDX-License-Identifier: GPL-3.0-or-later
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT } from './sync.mjs';

const browser = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].filter(Boolean).find(existsSync);
if (!browser) { console.error('✗ Chrome not found (set CHROME_PATH)'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 5200 + Math.floor(Math.random() * 90) + 10;
const debugPort = 9300 + Math.floor(Math.random() * 600);
const server = spawn(process.execPath, [join(ROOT, 'serve.mjs'), String(port)], { stdio: 'ignore' });
const profile = mkdtempSync(join(tmpdir(), 'fightendo-shots-'));
const chrome = spawn(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  ...(process.platform === 'linux' ? ['--no-sandbox'] : []),
  '--user-data-dir=' + profile, '--remote-debugging-port=' + debugPort, 'about:blank'], { stdio: 'ignore' });

const devices = [['iphone', 430, 932, 3], ['android', 360, 640, 3]];
const shots = [['start', ''], ['symptoms', '.symlist'], ['history', '.rows'], ['letter', '.letter-out'], ['letter', '.tips']];

try {
  let wsUrl = null;
  for (let i = 0; i < 120 && !wsUrl; i++) {
    await sleep(500);
    try {
      const list = await (await fetch('http://127.0.0.1:' + debugPort + '/json/list')).json();
      const page = list.find((t) => t.type === 'page');
      if (page) wsUrl = page.webSocketDebuggerUrl;
    } catch (e) { /* starting */ }
  }
  if (!wsUrl) throw new Error('browser did not start');
  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (pending.has(d.id)) { pending.get(d.id)(d.result || {}); pending.delete(d.id); } };
  const send = (method, params) => new Promise((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params: params || {} })); });

  await send('Page.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  for (const lang of ['de', 'en']) {
    const dir = join(ROOT, 'assets/store/screenshots', lang);
    mkdirSync(dir, { recursive: true });
    for (const [device, w, h, dpr] of devices) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: true });
      for (let i = 0; i < shots.length; i++) {
        const [view, scroll] = shots[i];
        const url = 'http://localhost:' + port + '/assets/demo.html?lang=' + lang + '&view=' + view + (scroll ? '&scroll=' + encodeURIComponent(scroll) : '');
        await send('Page.navigate', { url });
        await sleep(1800);   // page + iframe + scroll (generous for slow machines)
        if (process.env.DEBUG_SHOTS) console.log(JSON.stringify(await send('Runtime.evaluate', { expression: '[innerWidth, devicePixelRatio, document.querySelector("iframe") && document.querySelector("iframe").contentWindow.innerWidth].join()', returnByValue: true })));
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        const file = join(dir, device + '-' + (i + 1) + '-' + view + '.png');
        writeFileSync(file, Buffer.from(shot.data, 'base64'));
        console.log('✓ ' + file.slice(ROOT.length + 1));
      }
    }
  }
  ws.close();
} finally {
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
  else chrome.kill('SIGKILL');
  server.kill();
  await sleep(800);
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* locked */ }
}
