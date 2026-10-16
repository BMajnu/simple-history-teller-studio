/**
 * Daemon Browser — YouTube Studio Chapters Updater (BN long-form)
 * SOP: AUTONOMOUS_WORKFLOW_SOP.md §8 + daemon.js /run-script bridge
 * Video: https://studio.youtube.com/video/ibG0M13m7I0/edit
 * Run: node tools/update_youtube_chapters_bn.js
 * Pre-req: daemon.js running (9333) + Vivaldi/Chrome with --remote-debugging-port=9224
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const DAEMON = '127.0.0.1';
const DAEMON_PORT = 9333;
const TARGET_URL = 'studio.youtube.com/video/ibG0M13m7I0';
const EDIT_URL = 'https://studio.youtube.com/video/ibG0M13m7I0/edit';

function daemonPost(pathname, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({ host: DAEMON, port: DAEMON_PORT, path: pathname, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, json: JSON.parse(raw) }); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function daemonGet(pathname) {
  return new Promise((resolve, reject) => {
    http.get({ host: DAEMON, port: DAEMON_PORT, path: pathname }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

async function main() {
  const seoPath = path.resolve(__dirname, '..', 'projects', 'sample_first_king', 'metadata', 'youtube_seo.json');
  const seo = JSON.parse(fs.readFileSync(seoPath, 'utf8'));
  const newDescription = seo.channels.bn.description;
  console.log('[1/4] BN description loaded:', newDescription.length, 'chars');

  const status = await daemonGet('/status');
  console.log('[2/4] Daemon connected:', status.connected, '| tabs:', status.tabCount);
  if (!status.connected) throw new Error('Browser CDP not connected.');
  const hasStudio = (status.tabs || []).some((t) => String(t.url).includes('studio.youtube.com'));
  console.log('[2/4] Studio tab open:', hasStudio);

  // NOTE: inside /run-script sandbox only (page, browser, require) exist.
  // All DOM access must go through page.locator / page.evaluate — never bare document/location.
  const code = [
    'const newDesc = ' + JSON.stringify(newDescription) + ';',
    'const editUrl = ' + JSON.stringify(EDIT_URL) + ';',
    'const out = { before: page.url() };',
    "if (!out.before.includes('ibG0M13m7I0/edit')) {",
    '  await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 30000 });',
    '  await page.waitForTimeout(6000);',
    '}',
    'out.afterNav = page.url();',
    "const descBox = page.locator('#description-textarea #textbox').first();",
    "await descBox.waitFor({ state: 'visible', timeout: 25000 });",
    'await descBox.scrollIntoViewIfNeeded();',
    'await descBox.click();',
    'await page.waitForTimeout(800);',
    'await page.evaluate((text) => {',
    "  const el = document.querySelector('#description-textarea #textbox');",
    '  el.focus();',
    "  document.execCommand('selectAll', false, null);",
    "  document.execCommand('delete', false, null);",
    "  document.execCommand('insertText', false, text);",
    "  el.dispatchEvent(new Event('input', { bubbles: true }));",
    "  el.dispatchEvent(new Event('change', { bubbles: true }));",
    '}, newDesc);',
    'await page.waitForTimeout(1500);',
    "await page.screenshot({ path: 'tools/chapters_before_save.png' });",
    "const saveBtn = page.locator('ytcp-button:has-text(\"Save\"), #save-button').first();",
    "await saveBtn.waitFor({ state: 'visible', timeout: 10000 });",
    'await saveBtn.click({ force: true });',
    'await page.waitForTimeout(6000);',
    "await page.screenshot({ path: 'tools/chapters_after_save.png' });",
    'out.saved = await page.evaluate(() => {',
    "  const t = document.body.innerText;",
    "  return t.includes('01:41') && t.includes('10:40');",
    '});',
    'out.done = true;',
    'return out;'
  ].join('\n');

  console.log('[3/4] Posting /run-script to daemon...');
  const res = await daemonPost('/run-script', { code, targetUrl: TARGET_URL });
  console.log('[4/4] Result:', JSON.stringify(res.json, null, 2));
  if (res.status !== 200 || !res.json.ok) throw new Error('Automation failed: ' + (res.json.error || res.status));
  console.log('=== CHAPTERS UPDATED — verify tools/chapters_after_save.png ===');
}

main().then(() => process.exit(0)).catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
