// Generates era-style BGM act clips via AI Studio Lyria 3.5 (Google Music model).
// Saves to projects/simple_itihash_004_first_city/audio/bgm_lyria/act1..act5.mp3
// Usage: node tools/gen_bgm_lyria_firstcity.js
// Probe single act: $env:ONLY_ACT='1'; node tools/gen_bgm_lyria_firstcity.js
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PROFILE_DIR = process.env.BGM_PROFILE_DIR
  || path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile_2');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const OUTDIR = path.join(ROOT, 'projects', 'simple_itihash_004_first_city', 'audio', 'bgm_lyria');
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');
const SLOTS = (process.env.BGM_SLOTS || '0,1,2,3,4').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);

// Per-act Lyria prompts (short - Lyria works best compact; intensity arcs from bgm_prompt.txt)
const ACTS = [
  { n: 1, len: 212, prompt: 'Ancient Mesopotamian dawn documentary soundtrack: solitary reed flute (ney) over a deep resonant drone, ambient desert wind, sparse frame-drum heartbeat. Mysterious, timeless, prehistoric curiosity. Slow tempo, purely instrumental, no vocals.' },
  { n: 2, len: 242, prompt: 'Warm ancient near-eastern hand percussion grows steady: plucked oud and harp arpeggios, harvest frame drums, clay pot claps, a hopeful rising major-mode melody with light tribal rhythm. Agriculture and surplus, humanity picking up pace. Instrumental, no vocals.' },
  { n: 3, len: 242, prompt: 'Cinematic ancient Mesopotamian majesty: regal bronze bells, deep war drums, full strings swell, minor-key string ostinato, trumpet-like reed calls. Ten thousand builders raising temple walls of the first city. Monumental and awe-inspiring. Instrumental, no vocals.' },
  { n: 4, len: 192, prompt: 'Playful rustic ancient celebration turning delicate: bouncy tambourine folk rhythm, cheerful wood flute, then gentle plucked lute and a soft celesta-like motif gliding like a reed stylus across clay. Joyful, witty, quietly revolutionary. Instrumental, no vocals.' },
  { n: 5, len: 220, prompt: 'Proud uplifting resolution: warm orchestral strings rising in bright major-key harmony, dignified percussion, then a lone echoing reed flute over soft harp plucks and desert wind, long reverberant gentle fade. Wise, reflective, triumphant. Instrumental, no vocals.' }
];

const isQuotaText = (t) => /generation failed|http status code|daily limit|exceeded your limit|quota exceeded|unable to generate|try again later/i.test(t || '');

async function genAct(ctx, act) {
  for (const slot of SLOTS) {
    const page = ctx.pages()[0] || await ctx.newPage();
    try {
      const url = `https://aistudio.google.com/u/${slot}/new_music?model=lyria-3.5`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3000);
      // If this session already holds a generated result, open a fresh project
      let stale = await page.evaluate(() => {
        const a = document.querySelector('audio');
        return !!(a && a.src);
      }).catch(() => false);
      if (stale) {
        const np = page.locator('button[aria-label="New project"], button[aria-label="New music project"], button[aria-label*="New project" i]').first();
        if (await np.isVisible().catch(() => false)) {
          await np.click().catch(() => {});
          await page.waitForTimeout(4000);
          stale = await page.evaluate(() => { const a = document.querySelector('audio'); return !!(a && a.src); }).catch(() => false);
        }
        if (stale) {
          await page.goto(`${url}&x=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
          await page.waitForTimeout(4000);
        }
      }
      // Landing screen: open the editor via a starter suggestion/card first
      const starters = ['Compose a cinematic orchestral hybrid score', 'Produce a 90s indie alt-rock anthem with vocals', 'Build a peak-time big-room EDM festival drop'];
      for (const s of starters) {
        const el = page.locator(`text=${s}`).first();
        if (await el.isVisible().catch(() => false)) {
          await el.click().catch(() => {});
          await page.waitForTimeout(3500);
          break;
        }
      }
      const ta = page.locator('textarea, div[contenteditable="true"]').first();
      await ta.waitFor({ timeout: 15000 });
      const preSrc = await page.evaluate(() => { const a = document.querySelector('audio'); return a && a.src ? a.src : null; }).catch(() => null);
      let b64 = null, dur = 0;
      for (let gTry = 0; gTry < 3 && !b64; gTry++) {
        await ta.click({ delay: 40 });
        await ta.fill(act.prompt);
        await page.waitForTimeout(600);
        const genBtn = page.locator('button:has-text("Generate")').first();
        if (!(await genBtn.isVisible().catch(() => false))) {
          console.log(`[A${act.n} u/${slot}] Generate btn not visible, body: ${(await page.evaluate(() => document.body.innerText)).slice(0, 200).replace(/\n+/g, ' ')}`);
          break;
        }
        await genBtn.click();
        console.log(`[A${act.n} u/${slot}] Generate clicked (try ${gTry + 1})`);
        for (let i = 0; i < 90; i++) {
          await page.waitForTimeout(2000);
          const st = await page.evaluate((pre) => {
            const a = document.querySelector('audio');
            return {
              busy: document.querySelectorAll('button[aria-label="Stop"], mat-spinner, .spinner, .music-player-generating').length > 0,
              src: a && a.src ? a.src : null,
              dur: a && a.duration ? a.duration : 0
            };
          }, preSrc).catch(() => ({ busy: false, src: null, dur: 0 }));
          const bodyTxt = (i >= 2 && i % 15 === 0) ? await page.evaluate(() => {
            const alerts = [...document.querySelectorAll('[role="alert"], .error-toast, snackbar-container, mat-snack-bar-container')].map(e => e.innerText).filter(Boolean);
            if (alerts.length) return alerts.join(' | ').slice(0, 500);
            const m = document.body.innerText.match(/Generation failed[^\n]*/i);
            return m ? m[0] : '';
          }) : '';
          if (isQuotaText(bodyTxt)) {
            console.log(`[A${act.n} u/${slot}] GATE: ${bodyTxt.slice(0, 160).replace(/\n+/g, ' ')}`);
            break;
          }
          if ((i + 1) % 15 === 0) console.log(`[A${act.n} u/${slot}] t=${(i + 1) * 2}s busy=${st.busy} srcDelta=${st.src && st.src !== preSrc} dur=${st.dur || 0}`);
          if (!st.busy && st.src && st.src !== preSrc && st.dur > 10) {
            dur = st.dur;
            b64 = await page.evaluate(async (src) => {
              const resp = await fetch(src);
              const buf = await resp.arrayBuffer();
              const bytes = new Uint8Array(buf);
              let bin = '';
              for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
              return btoa(bin);
            }, st.src).catch(() => null);
            break;
          }
        }
        if (!b64) {
          try { await page.screenshot({ path: path.join(__dirname, `bgm_act${act.n}_t${gTry}.png`) }); } catch {}
        }
      }
      if (b64) {
        const out = path.join(OUTDIR, `act${act.n}.mp3`);
        fs.writeFileSync(out, Buffer.from(b64, 'base64'));
        const size = fs.statSync(out).size;
        console.log(`OK act${act.n} u/${slot} saved ${size}B (player dur ${dur}s, target ${act.len}s)`);
        return true;
      }
      console.log(`[A${act.n} u/${slot}] no audio captured, rotating slot`);
    } catch (e) {
      console.log(`[A${act.n} u/${slot}] ERR ${e.message.slice(0, 120)}`);
      try { await page.screenshot({ path: path.join(__dirname, `bgm_act${act.n}_err.png`) }); } catch {}
    }
  }
  console.log(`FAIL act${act.n}`);
  return false;
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const only = process.env.ONLY_ACT ? [parseInt(process.env.ONLY_ACT, 10)]
    : (process.env.ONLY_ACTS ? process.env.ONLY_ACTS.split(',').map(x => parseInt(x.trim(), 10)) : null);
  const queue = only ? ACTS.filter(a => only.includes(a.n)) : ACTS;
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      '--headless=new',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--window-size=1280,800',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    ],
    viewport: { width: 1280, height: 800 }
  });
  let ok = 0, fail = [];
  for (const act of queue) {
    if (await genAct(ctx, act)) ok++; else fail.push(act.n);
  }
  console.log(`SUMMARY bgm-lyria: ok=${ok}/${queue.length} failActs=[${fail.join(',')}]`);
  // probe durations
  for (const f of fs.readdirSync(OUTDIR).sort()) {
    try {
      const d = parseFloat(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', path.join(OUTDIR, f)]).toString().trim());
      console.log(`clip ${f}: ${d.toFixed(1)}s`);
    } catch {}
  }
  await ctx.close();
  process.exit(fail.length ? 0 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
