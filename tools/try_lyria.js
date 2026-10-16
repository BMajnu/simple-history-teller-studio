// Lyria REAL attempt (temp output only — project bgm untouched).
// Run: node tools/try_lyria.js
const fs = require('fs');
const http = require('http');
const PROMPT = `[0:00 - 0:45] Intro: Intensity: 3/10. Ancient prehistoric documentary atmosphere. Resonant low earthen drone and subtle desert wind. Primal hollow log and frame drum percussion. A solitary Middle Eastern Ney reed flute playing a haunting, contemplative ancient melody, evoking 300,000 years of egalitarian hunter-gatherers living in freedom without rulers or kings. No vocals. Instrumental.
[0:45 - 1:30] Build: Intensity: 5/10. The Agricultural Revolution in the Fertile Crescent. Driving acoustic tribal percussion and ancient sistrum rattles enter with steady rhythm. Mesopotamian Oud introduces an enigmatic, suspenseful modal motif. Tension rises as granaries fill, jealousy and tribal border disputes ignite, and early Sumerians elect temporary war chiefs. No vocals. Instrumental.
[1:30 - 2:20] Climax: Intensity: 8/10. Divine kingship and bronze imperial conquest. The rise of Sargon of Akkad and the world's first standing bronze army. Driving heavy war drums, resonant bronze war horns, sweeping cinematic orchestral strings, and regal brass fanfares portraying monumental ziggurats and the terrifying power of the first permanent throne. No vocals. Instrumental.
[2:20 - 2:50] Outro: Intensity: 3/10. Contemplative and reverent historical resolution. Royal cemetery of Ur and Hammurabi's ancient law codes. Decaying Ney flute echoes, gentle acoustic lute arpeggios, and soft desert wind fading into silence, leaving a deep philosophical reverence for the paradox of human civilization. No vocals. Instrumental.`;
function post(body, ms) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({ host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, json: JSON.parse(raw) }); } catch (e) { reject(new Error('bad json len=' + raw.length)); } });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('daemon timeout')));
    req.write(data);
    req.end();
  });
}
const code = [
  'return (async () => {',
  'const R = {};',
  'const ctx = browser.contexts()[0];',
  'const pg = ctx.pages().find((p) => (p.url() || "").includes("new_music")) || null;',
  'if (!pg) return { fail: "no music tab" };',
  'try {',
  '  await pg.waitForTimeout(12000);',
  '  const card = pg.locator("text=Cinematic Score").first();',
  '  if ((await card.count().catch(() => 0)) > 0) { await card.click({ force: true }); await pg.waitForTimeout(6000); }',
  '  const box = pg.locator("textarea, div[contenteditable=\\"true\\"], [role=\\"textbox\\"]").first();',
  '  await box.waitFor({ state: "visible", timeout: 30000 });',
  '  await box.click({ force: true }); await box.fill(' + JSON.stringify(PROMPT) + ');',
  '  await pg.waitForTimeout(600);',
  '  R.filled = true;',
  '  const gen = pg.locator("button:has-text(\\"Generate\\")").first();',
  '  if ((await gen.count().catch(() => 0)) === 0) { R.fail = "no generate btn"; return R; }',
  '  await gen.click({ force: true });',
  '  let elapsed = 0, done = false, err = null;',
  '  while (elapsed < 300000) {',
  '    await pg.waitForTimeout(5000); elapsed += 5000;',
  '    const st = await pg.evaluate(() => {',
  '      const auds = Array.from(document.querySelectorAll("audio")).map((a) => ({ src: (a.src || a.currentSrc || "").slice(0, 60), dur: a.duration || 0 }));',
  '      const t = document.body.innerText;',
  '      const m = t.match(/Failed[^.]{0,80}\\.|permission denied[^.]{0,80}|paid API key[^.]{0,80}|select an API key[^.]{0,80}|quota[^.]{0,60}|rate limit[^.]{0,60}|error[^.]{0,60}/i);',
  '      return { auds, err: m ? m[0].slice(0, 120) : null };',
  '    }).catch(() => ({}));',
  '    if (st.err) { err = st.err; break; }',
  '    const ready = (st.auds || []).find((a) => a.dur > 20);',
  '    if (ready) { R.dur = ready.dur; R.src = ready.src; done = true; break; }',
  '  }',
  '  if (!done) { R.fail = err ? ("blocked: " + err) : "gen timeout"; return R; }',
  '  const pic = await pg.evaluate(async () => {',
  '    const a = Array.from(document.querySelectorAll("audio")).find((x) => (x.duration || 0) > 20);',
  '    if (!a) return null;',
  '    const r = await fetch(a.src || a.currentSrc); const b = await r.blob();',
  '    return await new Promise((res) => { const fr = new FileReader();',
  '      fr.onloadend = () => res({ data: fr.result.split(",")[1] }); fr.readAsDataURL(b); });',
  '  });',
  '  if (!pic) { R.fail = "capture failed"; return R; }',
  '  R.ok = true; R.b64 = pic.data;',
  '} catch (e) { R.fail = String(e.message || e).slice(0, 120); }',
  'return R;',
  '})()',
].join('\n');
async function main() {
  console.log('Lyria attempt (watch app browser, backgrounded)...');
  const res = await post({ code, targetUrl: 'new_music' }, 420000);
  const r = res.json && res.json.result;
  if (res.status === 200 && res.json.ok && r && r.ok && r.b64) {
    const out = 'C:/Users/badiu/AppData/Local/Temp/opencode/lyria_try.wav';
    fs.writeFileSync(out, Buffer.from(r.b64, 'base64'));
    console.log('SAVED ' + out + ' (' + (fs.statSync(out).size / 1048576).toFixed(1) + 'MB) dur~' + Math.round(r.dur) + 's');
    process.exit(0);
  }
  console.log('RESULT: ' + JSON.stringify(r).slice(0, 300));
  process.exit(2);
}
main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
