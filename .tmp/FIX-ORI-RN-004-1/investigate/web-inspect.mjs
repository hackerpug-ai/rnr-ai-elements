import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { Readable } from 'node:stream';
import { chromium } from '@playwright/test';

const distDir = process.argv[2];
const backendPort = 4001;
const servePort = 8406;
const MARKER = 'ORI-RN-004:INV:web';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.map': 'application/json' };

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${servePort}`);
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    const chunks = [];
    for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(String(c)));
    const upstream = await fetch(`http://127.0.0.1:${backendPort}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: Buffer.concat(chunks) });
    res.writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') ?? 'text/event-stream' });
    if (upstream.body) Readable.fromWeb(upstream.body).pipe(res); else res.end();
    return;
  }
  let path = url.pathname;
  if (path === '/') path = '/index.html';
  let fp = join(distDir, path);
  if (!existsSync(fp) && !extname(path)) fp = `${fp}.html`;
  if (!existsSync(fp)) fp = join(distDir, 'index.html');
  res.writeHead(200, { 'content-type': MIME[extname(fp)] ?? 'application/octet-stream' });
  res.end(readFileSync(fp));
});
server.listen(servePort, '127.0.0.1', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const consoleMsgs = [];
  page.on('console', (m) => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => consoleMsgs.push(`[pageerror] ${e.message}`));
  try {
    await page.goto(`http://127.0.0.1:${servePort}/live-chat`, { waitUntil: 'networkidle', timeout: 60000 });
    const ta = page.getByLabel('Message', { exact: true });
    await ta.click();
    await ta.fill(MARKER);
    await page.getByLabel('Send message', { exact: true }).click();
    // wait for streaming to finish (~10s)
    await page.waitForTimeout(12000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('=== BODY TEXT (first 1500 chars) ===');
    console.log(bodyText.slice(0, 1500));
    console.log('=== contains "rain"? ===', bodyText.includes('rain'));
    console.log('=== contains marker? ===', bodyText.includes(MARKER));
    console.log('=== CONSOLE (filtered) ===');
    for (const m of consoleMsgs) if (/418|hydrat|error|Error|rain/i.test(m)) console.log(m);
  } catch (e) {
    console.log('ERROR', e);
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
});
