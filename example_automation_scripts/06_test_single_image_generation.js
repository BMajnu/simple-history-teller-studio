const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const VISUAL = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse', 'visual_assets');

if (!fs.existsSync(VISUAL)) fs.mkdirSync(VISUAL, { recursive: true });

(async () => {
  console.log('Testing Nano Banana 2.1 (Default) with Nano Banana 2 (1st Fallback) on Scene 2...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  const defaultModel = 'gemini-nano-banana-2.1';
  const fallbackModel = 'gemini-3.1-flash-image';
  await page.goto(`https://aistudio.google.com/u/0/prompts/new_chat?model=${defaultModel}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Set "Images only"
  const imagesOnlyBtn = page.locator('button:has-text("Images only")').first();
  if (await imagesOnlyBtn.count() > 0) {
    console.log('Selecting Images only...');
    await imagesOnlyBtn.click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // Set Aspect ratio to 16:9
  const arSelect = page.locator('button:has-text("Auto"), [aria-label*="Aspect"]').first();
  if (await arSelect.count() > 0) {
    console.log('Setting Aspect ratio to 16:9...');
    await arSelect.click().catch(() => {});
    await page.waitForTimeout(600);
    const opt169 = page.locator('.cdk-overlay-container, mat-option, [role="option"]').filter({ hasText: '16:9' }).first();
    if (await opt169.count() > 0) {
      await opt169.click().catch(() => {});
      await page.waitForTimeout(500);
    }
  }

  // Track existing images
  const prevImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(i => i.src);
  });

  const prompt = 'Simple History 2D graphic novel style, clean outlines, warm parchment palette, an ornate ancient world map depicting bustling shipping lanes across Egypt, Greece, Cyprus, and Anatolia with golden miniature ships and trade routes, 16:9 widescreen historical illustration. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients';

  console.log('Entering prompt...');
  const input = page.locator('textarea, rich-textarea, [contenteditable="true"]').first();
  await input.click();
  await input.fill(prompt);
  await page.waitForTimeout(600);

  console.log('Clicking Run Ctrl...');
  const runBtn = page.locator('button:has-text("Run")').first();
  await runBtn.click();

  // Wait for new image to appear
  console.log('Waiting for generated image...');
  let freshSrc = null;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(2000);
    const curImgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(i => i.naturalWidth > 300 && !i.src.includes('googleusercontent.com/a/'))
        .map(i => i.src);
    });

    const diff = curImgs.filter(s => !prevImgs.includes(s));
    if (diff.length > 0) {
      freshSrc = diff[diff.length - 1];
      console.log(`Found generated image in poll ${i + 1}!`);
      break;
    }
    process.stdout.write('.');
  }

  await page.screenshot({ path: path.join(__dirname, 'after_image_run.png') });
  console.log('\nSaved after_image_run.png');

  if (freshSrc) {
    console.log('Extracting image bytes...');
    const b64Data = await page.evaluate(async (src) => {
      try {
        const r = await fetch(src);
        const b = await r.blob();
        const buf = await b.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let bin = '';
        for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), size: bytes.length, type: b.type };
      } catch (e) {
        return { err: e.message };
      }
    }, freshSrc);

    if (b64Data && b64Data.b64) {
      const outPath = path.join(VISUAL, 'scene_0002.png');
      fs.writeFileSync(outPath, Buffer.from(b64Data.b64, 'base64'));
      console.log(`✓ SUCCESS! Scene 2 Image saved to: ${outPath} (${(b64Data.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error('Failed to extract image base64:', b64Data);
    }
  } else {
    console.log('Timeout waiting for generated image.');
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
