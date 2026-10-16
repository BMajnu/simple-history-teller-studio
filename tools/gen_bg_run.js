// Visible single-background generator for the dedicated Nano Banana 2.1 tab.
// Run: node tools/gen_bg_run.js <1..5>   (tab already set: 9:16, 2K, High, Images-only)
// Out: projects/sample_first_king/visual_assets/bg_full{P}.jpg + tools/fx_bg{P}.png
const fs = require('fs');
const path = require('path');
const http = require('http');

const N = process.argv[2];
if (!['1', '2', '3', '4', '5'].includes(N)) { console.error('usage: node tools/gen_bg_run.js <1..5>'); process.exit(1); }
const NOTEXT = ' --no text, typography, letters, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients';
const PROMPTS = {
  1: 'OverSimplified cartoon sticky-meme style vertical illustration, prehistoric Kalahari hunters around glowing campfire under starry desert night, one proud hunter with spear beside huge hunted beast while tribesmen laugh and tease him, warm orange fire glow vs deep blue night sky, bold clean vector outlines, vibrant cinematic lighting' + NOTEXT,
  2: 'OverSimplified cartoon sticky-meme style vertical illustration, ancient agricultural revolution, giant clay grain silos bursting with golden wheat, exhausted sweating farmer with wooden sickle in fertile green field, sacks of grain piled high, golden sunrise horizon, vibrant saturated colors, bold clean vector outlines' + NOTEXT,
  3: 'OverSimplified cartoon sticky-meme style vertical illustration, menacing ancient warlord in bronze helmet and armor holding spear, forcefully grabbing basket of grain from terrified skinny farmer at mudbrick village gate, guards with torches behind, dramatic orange sunset sky, bold clean vector outlines, cinematic lighting' + NOTEXT,
  4: 'OverSimplified cartoon sticky-meme style vertical illustration, mighty ancient Sumerian king with golden horned crown on magnificent golden throne, giant mudbrick ziggurat pyramid behind, rows of disciplined soldiers with spears and shields, royal golden dramatic lighting, bold clean vector outlines' + NOTEXT,
  5: 'OverSimplified cartoon sticky-meme style vertical illustration, ancient royal stone sarcophagus and broken crown in dim museum hall beside crumbling desert ruins at golden dawn, open antique leather history journal in foreground, distant modern city skyline on horizon, hopeful warm light, bold clean vector outlines' + NOTEXT,
};
const OUT = path.resolve(__dirname, '..', 'projects', 'sample_first_king', 'visual_assets', 'bg_full' + N + '.jpg');

function post(pathname, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({ host: '127.0.0.1', port: 9333, path: pathname, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: 280000 }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, json: JSON.parse(raw) }); } catch (e) { reject(new Error('bad json')); } });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('daemon timeout')));
    req.write(data);
    req.end();
  });
}

async function main() {
  if (fs.existsSync(OUT) && fs.statSync(OUT).size > 50000) { console.log('SKIP bg_full' + N + ' (exists)'); return; }
  const code = [
    'const prompt = ' + JSON.stringify(PROMPTS[N]) + ';',
    'const shot = ' + JSON.stringify('tools/fx_bg' + N + '.png') + ';',
    'await page.bringToFront();',
    'await page.waitForTimeout(800);',
    'await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));',
    'await page.waitForTimeout(2500);',
    'const before = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);',
    'const box = page.locator("[placeholder*=\\"Start typing\\"]").first();',
    'await box.waitFor({ state: "visible", timeout: 20000 });',
    'await box.click({ force: true });',
    'await box.fill(prompt);',
    'await page.waitForTimeout(500);',
    'await page.locator("button:has-text(\\"Run\\")").last().click({ force: true });',
    'let stable = 0, last = "", elapsed = 0, cur = [];',
    'while (elapsed < 200000) {',
    '  await page.waitForTimeout(4000); elapsed += 4000;',
    '  cur = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);',
    '  const fresh = cur.filter(s => before.indexOf(s) < 0);',
    '  if (fresh.length > 0 && fresh.join("|") === last) { stable++; if (stable >= 3) break; }',
    '  else { stable = 0; last = fresh.join("|"); }',
    '}',
    'await page.waitForTimeout(1500);',
    'await page.screenshot({ path: shot });',
    'const pic = await page.evaluate(async (oldList) => {',
    '  const all = Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 200);',
    '  const fresh = all.filter(el => oldList.indexOf(el.src) < 0);',
    '  const t = fresh.length > 0 ? fresh[fresh.length - 1] : null;',
    '  if (!t) return null;',
    '  const r = await fetch(t.src); const b = await r.blob();',
    '  return await new Promise((res) => { const fr = new FileReader();',
    '    fr.onloadend = () => res({ data: fr.result.split(",")[1], w: t.naturalWidth, h: t.naturalHeight });',
    '    fr.readAsDataURL(b); });',
    '}, before);',
    'if (!pic) return { ok: false, reason: "no image" };',
    'return { ok: true, w: pic.w, h: pic.h, b64: pic.data };',
  ].join('\n');
  console.log('Generating bg_full' + N + ' (watch Vivaldi AI Studio tab)...');
  const res = await post('/run-script', { code, targetUrl: 'new_chat' });
  if (res.status !== 200 || !res.json.ok || !res.json.result.ok) throw new Error('gen failed: ' + JSON.stringify(res.json).slice(0, 300));
  const r = res.json.result;
  fs.writeFileSync(OUT, Buffer.from(r.b64, 'base64'));
  const prev = path.resolve(__dirname, '..', 'projects', 'sample_first_king', 'visual_assets', 'bg_full' + (Number(N) - 1) + '.jpg');
  if (Number(N) > 1 && fs.existsSync(prev) && fs.readFileSync(OUT).equals(fs.readFileSync(prev))) {
    fs.unlinkSync(OUT);
    throw new Error('duplicate of bg_full' + (Number(N) - 1) + ' captured — rerun gen_bg_run.js ' + N);
  }
  console.log('SAVED bg_full' + N + '.jpg (' + r.w + 'x' + r.h + ', ' + (fs.statSync(OUT).size / 1024).toFixed(0) + 'KB)');
}
main().then(() => process.exit(0)).catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
