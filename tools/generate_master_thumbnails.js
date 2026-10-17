const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const META = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse', 'metadata');

const THUMBNAILS = [
  {
    lang: 'bn',
    file: 'bn_thumbnail.png',
    prompt: 'Simple History 2D graphic novel documentary art, epic dramatic split confrontation. On the left, a fierce horned-helmet Sea Peoples raider with glowing eyes holding a notched bronze slashing sword and round shield; on the right, Pharaoh Ramesses III in gleaming golden battle armor and blue royal khepresh crown drawing a golden war-bow; between them in the background, ancient Ugarit citadels burning in an apocalyptic orange inferno under dark stormy skies, dramatic high-CTR YouTube thumbnail composition, 16:9 widescreen, clean comic art. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render'
  },
  {
    lang: 'en',
    file: 'en_thumbnail.png',
    prompt: 'Simple History 2D graphic novel documentary art, epic dramatic split confrontation. On the left, a menacing barbarian Sea Peoples warrior with a horned bronze helmet and broadsword; on the right, Pharaoh Ramesses III drawing a majestic royal war bow; in the background, ancient Mediterranean citadels and stone temples collapsing in fire and smoke, high-CTR YouTube documentary thumbnail composition, 16:9 widescreen, clean comic art. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render'
  },
  {
    lang: 'hi',
    file: 'hi_thumbnail.png',
    prompt: 'Simple History 2D graphic novel documentary art, epic dramatic split confrontation between a horned Sea Peoples sea warrior and Egyptian Pharaoh Ramesses III, with Hattusa and Ugarit burning in apocalyptic flames behind them, high-CTR YouTube documentary thumbnail, 16:9 widescreen, vibrant comic lighting. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render'
  }
];

(async () => {
  console.log('=== GENERATING MASTER THUMBNAILS (BN, EN, HI) ON SLOT u/0 (PRO) ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  for (const t of THUMBNAILS) {
    const outPath = path.join(META, t.file);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) {
      console.log(`Thumbnail ${t.file} already exists, skipping.`);
      continue;
    }

    console.log(`Generating ${t.lang.toUpperCase()} thumbnail: ${t.file}...`);
    const imgModel = 'gemini-nano-banana-2.1'; // Default: Nano Banana 2.1 (Fallback: gemini-3.1-flash-image)
    await page.goto(`https://aistudio.google.com/u/0/prompts/new_chat?model=${imgModel}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');

    // 16:9
    try {
      const arBtn = page.locator('button:has-text("Auto"), [aria-label*="Aspect"]').first();
      if (await arBtn.count() > 0) {
        await arBtn.click().catch(() => {});
        await page.waitForTimeout(500);
        const opt169 = page.locator('.cdk-overlay-container, mat-option, [role="option"]').filter({ hasText: '16:9' }).first();
        if (await opt169.count() > 0) {
          await opt169.click().catch(() => {});
          await page.waitForTimeout(400);
        }
      }
    } catch(e) {}

    const prevImgs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).filter(i => i.naturalWidth > 300).map(i => i.src)
    );

    const ta = page.locator('textarea, rich-textarea, div[contenteditable="true"][role="textbox"]').first();
    await ta.waitFor({ state: 'visible', timeout: 25000 });
    await ta.click();
    await ta.fill(t.prompt);
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+Enter');

    let freshSrc = null;
    for (let p = 0; p < 25; p++) {
      await page.waitForTimeout(2000);
      const curImgs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img'))
          .filter(i => i.naturalWidth > 300 && !i.src.includes('googleusercontent.com/a/'))
          .map(i => i.src)
      );
      const diff = curImgs.filter(s => !prevImgs.includes(s));
      if (diff.length > 0) {
        freshSrc = diff[diff.length - 1];
        break;
      }
    }

    if (freshSrc) {
      const b64Data = await page.evaluate(async (src) => {
        try {
          const r = await fetch(src);
          const b = await r.blob();
          const buf = await b.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let bin = '';
          for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
          return { b64: btoa(bin), size: bytes.length };
        } catch(e) { return { err: e.message }; }
      }, freshSrc);

      if (b64Data && b64Data.b64) {
        fs.writeFileSync(outPath, Buffer.from(b64Data.b64, 'base64'));
        console.log(`✓ SUCCESS! ${t.file} saved (${(b64Data.size / 1024).toFixed(0)} KB)`);
      }
    } else {
      console.log(`Failed to generate ${t.file}`);
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
