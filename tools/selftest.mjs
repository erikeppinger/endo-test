// Runs tests/selftest.html in a headless Chrome / Edge / Chromium and reports the result.
//   npm test                      (CHROME_PATH=... to pick a browser)
// Talks to the browser over the DevTools protocol and waits in real time until the
// page reports PASS/FAIL – slow machines and slow steps (key derivation) are fine.
// Needs Node 22+ (built-in WebSocket).
// SPDX-License-Identifier: GPL-3.0-or-later
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT } from './sync.mjs';

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) { console.error('✗ No Chrome/Edge/Chromium found. Set CHROME_PATH.'); process.exit(1); }
if (typeof WebSocket === 'undefined') { console.error('✗ Node 22 or newer is required (built-in WebSocket).'); process.exit(1); }

const port = 5200 + Math.floor(Math.random() * 90) + 10;
const debugPort = 9300 + Math.floor(Math.random() * 600);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(process.execPath, [join(ROOT, 'serve.mjs'), String(port)], { stdio: 'ignore' });
const profile = mkdtempSync(join(tmpdir(), 'fightendo-test-'));
const chrome = spawn(browser, [
  '--headless=new', '--disable-gpu', ...(process.platform === 'linux' ? ['--no-sandbox'] : []), '--no-first-run',
  '--user-data-dir=' + profile, '--remote-debugging-port=' + debugPort, '--window-size=390,844',
  'http://localhost:' + port + '/tests/selftest.html'
], { stdio: 'ignore' });

let exitCode = 1;
try {
  // Find the page's DevTools endpoint (give slow machines up to 60 s).
  let wsUrl = null;
  for (let i = 0; i < 120 && !wsUrl; i++) {
    await sleep(500);
    try {
      const list = await (await fetch('http://127.0.0.1:' + debugPort + '/json/list')).json();
      const page = list.find((t) => t.type === 'page' && /selftest/.test(t.url));
      if (page) wsUrl = page.webSocketDebuggerUrl;
    } catch (e) { /* browser still starting */ }
  }
  if (!wsUrl) throw new Error('browser did not open the test page');

  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
  const evaluate = (expr) => new Promise((r) => {
    const n = ++id;
    pending.set(n, (d) => r(d.result && d.result.result ? d.result.result.value : undefined));
    ws.send(JSON.stringify({ id: n, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
  });

  let status = 'running';
  const deadline = Date.now() + 300000;
  while (Date.now() < deadline) {
    status = await evaluate("(document.getElementById('summary') || {dataset:{}}).dataset.status");
    if (status === 'pass' || status === 'fail') break;
    await sleep(500);
  }
  const report = await evaluate("JSON.stringify({ summary: document.getElementById('summary').textContent, items: [...document.querySelectorAll('#results li')].map((li) => ({ ok: li.className === 'pass', text: li.firstChild.textContent, note: (li.querySelector('small') || {}).textContent || '' })) })");
  const r = JSON.parse(report || '{"summary":"no result","items":[]}');
  for (const it of r.items) console.log((it.ok ? '✓ ' : '✗ ') + it.text.replace(/^(PASS|FAIL) /, '') + (!it.ok && it.note ? '\n    ' + it.note : ''));
  console.log((status === 'pass' ? '✓ ' : '✗ ') + r.summary + '  (' + browser.split(/[\\/]/).pop() + ')');
  exitCode = status === 'pass' ? 0 : 1;
  ws.close();
} catch (e) {
  console.error('✗ ' + e.message);
} finally {
  // Kill the whole browser process tree (Chrome/Edge spawn helpers that outlive the launcher).
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
  else chrome.kill('SIGKILL');
  server.kill();
  await sleep(800);
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* browser may still hold files */ }
}
process.exit(exitCode);
