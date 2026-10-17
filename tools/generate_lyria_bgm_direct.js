const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse');
const OUT_BGM = path.join(PROJ, 'audio', 'bgm.mp3');
const OUT_BGM_DIR = path.join(PROJ, 'audio', 'bgm', 'bgm.mp3');

const BGM_PROMPT = `Ancient Mediterranean historical documentary soundtrack, 48kHz stereo instrumental.
Act 1: Majestic Bronze Age trade, Egyptian reed flute Ney, delicate plucked Oud, classical harp arpeggios simulating Aegean sea waves, ancient prosperous ports.
Act 2: The Great Drought and Earthquake Storms, ominous deep cello ostinato, desert wind drone, rising tension, explosive kettledrum impacts and dissonant brass.
Act 3: War at Sea and Sea Peoples invasion, driving bronze war drums, aggressive cello rhythm, Middle Eastern brass melodies, tragic falling strings.
Act 4: Desolate aftermath transforming into the Dawn of the Iron Age, rhythmic anvil metallic pulses, soaring major-key strings, gentle harp outro fading into silence.
Purely instrumental, broadcast documentary balance, zero vocals.`;

(async () => {
  console.log('=== GENERATING DOCUMENTARY BGM WITH LYRIA 3.5 ON u/0 (PRO) ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  // Click prompt activator
  const btn = page.locator('button:has-text("Describe the music you want to generate")').first();
  if (await btn.count() > 0) {
    console.log('Clicking Describe Music activator...');
    await btn.click();
    await page.waitForTimeout(2000);
  }

  // Find textarea
  const ta = page.locator('textarea[placeholder*="Describe your music"], textarea').first();
  await ta.waitFor({ state: 'visible', timeout: 20000 });
  console.log('Filling BGM prompt into Lyria...');
  await ta.click();
  await ta.fill(BGM_PROMPT);
  await page.waitForTimeout(1000);

  // Click Generate
  const genBtn = page.locator('button:has-text("Generate")').first();
  console.log('Clicking Generate button...');
  await genBtn.click();
  await page.waitForTimeout(4000);

  // Monitor generation
  console.log('Waiting for Lyria 3.5 to compose and render soundtrack...');
  let audioFound = null;
  for (let p = 0; p < 90; p++) {
    await page.waitForTimeout(4000);
    const state = await page.evaluate(() => {
      const audios = Array.from(document.querySelectorAll('audio')).map(a => ({
        src: a.src || a.currentSrc,
        duration: a.duration || 0
      }));
      const text = document.body.innerText || '';
      const isGenerating = /generating|composing|spinner/i.test(text);
      const isDone = audios.some(a => a.duration > 15);
      return { audios, isGenerating, isDone, textSnippet: text.slice(0, 300) };
    });

    process.stdout.write(`.[poll ${p+1}]`);

    const readyAudio = state.audios.find(a => a.duration > 15 && a.src);
    if (readyAudio) {
      console.log(`\n✓ Lyria generation complete in poll ${p+1}! Duration: ${readyAudio.duration}s`);
      audioFound = readyAudio.src;
      break;
    }
  }

  await page.screenshot({ path: path.join(__dirname, 'lyria_after_generate.png') });
  console.log('\nSaved lyria_after_generate.png');

  if (audioFound) {
    console.log('Extracting audio stream...');
    const aData = await page.evaluate(async (src) => {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const buf = await blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let bin = '';
        for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), size: bytes.length };
      } catch(e) { return { err: e.message }; }
    }, audioFound);

    if (aData && aData.b64) {
      fs.writeFileSync(OUT_BGM, Buffer.from(aData.b64, 'base64'));
      fs.writeFileSync(OUT_BGM_DIR, Buffer.from(aData.b64, 'base64'));
      console.log(`✓ SUCCESS! Master BGM saved to: ${OUT_BGM} (${(aData.size / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      console.error('Audio extraction failed:', aData);
    }
  } else {
    console.log('Audio element timeout. Checking download buttons or track items on page...');
    const dlBtn = page.locator('button[aria-label*="Download"], a[download]').first();
    if (await dlBtn.count() > 0) {
      console.log('Found Download button on track, clicking...');
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }).catch(() => null),
        dlBtn.click()
      ]);
      if (download) {
        await download.saveAs(OUT_BGM);
        fs.copyFileSync(OUT_BGM, OUT_BGM_DIR);
        console.log(`✓ Downloaded BGM saved to: ${OUT_BGM}`);
      }
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal Lyria error:', err);
  process.exit(1);
});
