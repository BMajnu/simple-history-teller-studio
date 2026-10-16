const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'visual_assets');

async function testScene20() {
  console.log('--- GENERATING SCENE 20 ON /u/1/ (bmajnu980@gmail.com) ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  const url = 'https://aistudio.google.com/u/1/prompts/new_chat?model=gemini-omni-1.1-flash';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Aspect ratio 16:9
  const aspectSelect = page.locator('mat-select, [role="combobox"]').filter({ hasText: 'Auto' }).first();
  if (await aspectSelect.count() > 0) {
    await aspectSelect.click();
    await page.waitForTimeout(500);
    const option169 = page.locator('mat-option:has-text("16:9"), [role="option"]:has-text("16:9")').first();
    if (await option169.count() > 0) {
      await option169.click();
      await page.waitForTimeout(500);
      console.log('Aspect ratio: 16:9 set');
    }
  }

  // Set Resolution to 720p
  const resSelect = page.locator('mat-select, [role="combobox"]').filter({ hasText: '360p' }).first();
  if (await resSelect.count() > 0) {
    await resSelect.click();
    await page.waitForTimeout(500);
    const opt720 = page.locator('mat-option:has-text("720p"), [role="option"]:has-text("720p")').first();
    if (await opt720.count() > 0) {
      await opt720.click();
      await page.waitForTimeout(500);
      console.log('Resolution: 720p selected!');
    }
  }

  // Upload shot_0020.jpg
  const refImage = path.join(VISUAL_DIR, 'shot_0020.jpg');
  console.log('Uploading reference image:', refImage);
  const addBtn = page.locator('button[aria-label*="Insert images"], button:has-text("add_circle")').first();
  await addBtn.click();
  await page.waitForTimeout(1000);
  const uploadItem = page.locator('button:has-text("Upload"), [role="menuitem"]:has-text("Upload"), span:has-text("Upload")').first();
  const [fc] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 10000 }),
    uploadItem.click()
  ]);
  await fc.setFiles(refImage);
  console.log('Reference image uploaded!');
  await page.waitForTimeout(3000);

  // Set prompt
  const prompt = 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: Caveman on left hops on one foot screaming in cartoon agony after stubbing bare toe on a sharp rock, while caveman on right pinches nose in extreme disgust from a stinky green odor cloud, 2D cartoon animation, 24fps.';
  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(500);

  console.log('Clicking Run on /u/1/...');
  const runBtn = page.locator('button:has-text("Run"), button.ctrl-enter-submits').first();
  await runBtn.click();

  // Wait for video element
  console.log('Waiting for video generation...');
  let videoSrc = null;
  const startTime = Date.now();
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => {
      const vid = document.querySelector('video');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      const err = document.querySelector('.error-message, mat-error, [role="alert"]');
      return {
        hasVid: !!vid && !!vid.src,
        src: vid ? vid.src : null,
        hasStop: stop,
        error: err ? err.innerText : null
      };
    });

    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    console.log(`[${elapsedSec}s] StopBtn: ${state.hasStop} | Video: ${state.hasVid} | Err: ${state.error}`);
    if (state.hasVid && !state.hasStop) {
      videoSrc = state.src;
      console.log(`Generation completed in ${elapsedSec}s! Video src: ${videoSrc}`);
      break;
    }
  }

  if (!videoSrc) {
    throw new Error('Video generation timed out or failed!');
  }

  // Extract blob data
  console.log('Extracting video blob...');
  const videoBase64 = await page.evaluate(async (src) => {
    const res = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.readAsDataURL(blob);
    });
  }, videoSrc);

  const outFile = path.join(VISUAL_DIR, 'clip_shot_0020.mp4');
  const buffer = Buffer.from(videoBase64, 'base64');
  fs.writeFileSync(outFile, buffer);
  console.log(`Saved video to ${outFile} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  await page.screenshot({ path: 'tools/scene20_video_result.png' });
  await page.close();
}

testScene20().catch(console.error);
