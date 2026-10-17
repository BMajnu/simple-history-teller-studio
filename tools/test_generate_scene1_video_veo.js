const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const VISUAL = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse', 'visual_assets');
const OUT_VIDEO = path.join(VISUAL, 'clip_scene_0001.mp4');

(async () => {
  console.log('Testing Scene 1 Video Generation with Veo 3.1 Fast on u/0 (PRO)...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  await page.goto('https://aistudio.google.com/u/0/prompts/new_video?model=veo-3.1-fast-generate-preview', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape');

  // Dismiss any billing dialog or click Skip if present
  try {
    const skipBtn = page.locator('button:has-text("Skip")').first();
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  } catch(e) {}

  const prompt = 'Dynamic 2D animation in Simple History graphic novel style. Time Chronicler, an elderly bald scholar with thick bushy white beard, circular wire spectacles and flowing brown linen robes holding a flaming bronze torch and ancient history book, stepping through a swirling celestial time portal into ancient Mediterranean ruins, warm amber glow, 24fps motion. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients';

  console.log('Filling prompt into textarea...');
  const ta = page.locator('textarea[placeholder="Describe your video"], textarea').first();
  await ta.waitFor({ state: 'visible', timeout: 20000 });
  await ta.fill(prompt);
  await page.waitForTimeout(1000);

  console.log('Submitting prompt (Run)...');
  await page.keyboard.press('Control+Enter');

  // Wait to see if Run button triggers or generation starts
  console.log('Monitoring video generation...');
  let videoSrc = null;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => {
      const vid = document.querySelector('video');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      const err = document.querySelector('.error-message, mat-error, [role="alert"]');
      const text = document.body.innerText || '';
      const hasQuota = /exceeded quota|billing|API key/i.test(text);
      return {
        hasVid: !!vid && !!vid.src,
        src: vid ? vid.src : null,
        hasStop: stop,
        errText: err ? err.innerText : (hasQuota ? 'QUOTA_OR_BILLING' : null)
      };
    }).catch(e => ({ errText: e.message }));

    if (state.errText) {
      console.log(`Alert/Error state: ${state.errText}`);
      if (state.errText.includes('QUOTA') || state.errText.includes('billing')) {
        break;
      }
    }

    if (state.hasVid && !state.hasStop && state.src) {
      console.log(`\nVideo generated in poll ${i + 1}! Source:`, state.src);
      videoSrc = state.src;
      break;
    }
    process.stdout.write(`.${state.hasStop ? '(generating)' : ''}`);
  }

  await page.screenshot({ path: path.join(__dirname, 'after_video_probe.png') });
  console.log('\nSaved after_video_probe.png');

  if (videoSrc) {
    console.log('Extracting video bytes...');
    const vData = await page.evaluate(async (src) => {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const ab = await blob.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let bin = '';
        for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), size: bytes.length };
      } catch (e) {
        return { err: e.message };
      }
    }, videoSrc);

    if (vData && vData.b64) {
      fs.writeFileSync(OUT_VIDEO, Buffer.from(vData.b64, 'base64'));
      console.log(`✓ SUCCESS! Clip saved to: ${OUT_VIDEO} (${(vData.size / 1024).toFixed(0)} KB)`);
    } else {
      console.error('Failed to extract video bytes:', vData);
    }
  } else {
    console.log('No video src extracted. Check screenshot after_video_probe.png');
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal video error:', err);
  process.exit(1);
});
