const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const REFERENCE_IMG = 'D:\\Developing Projects\\Itihash Explainer Video\\projects\\simple_itihash_002_first_language\\visual_assets\\scene_0001.jpg';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('aistudio')) || await ctx.newPage();

  console.log('Navigating to new chat in AI Studio...');
  await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Set Aspect ratio to 1:1
  const arSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
  if (await arSelect.count() > 0) {
    await arSelect.click();
    await page.waitForTimeout(500);
    const opt11 = page.locator('mat-option:has-text("1:1")').first();
    if (await opt11.count() > 0) await opt11.click();
    await page.waitForTimeout(400);
  }

  // Upload reference image
  console.log('Uploading scene_0001.jpg as reference...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(REFERENCE_IMG);
  await page.waitForTimeout(3000);

  const promptText = 'Professional 2D cartoon mascot logo badge of the exact character from the reference image (The Wise Time Chronicler: bald on top with white beard, round glasses, simple tunic). Drawn in the exact 2D cartoon line art style of the reference image. The chronicler is smiling and holding an illuminated golden feather quill with magical ancient hieroglyphs and runes floating. In the background inside the badge are iconic ancient historical monuments (ancient Egyptian pyramids and ancient stone classical arches). Centered inside a circular royal navy and gold crest emblem. Clean minimalist mascot design, highly recognizable YouTube channel avatar, 1:1 square. Elegant ancient serif typography curved around the circular border reading "SIMPLE HISTORY TELLER".';

  console.log('Filling prompt...');
  const textarea = page.locator('textarea').first();
  await textarea.fill(promptText);
  await page.waitForTimeout(500);

  const prevImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(img => img.src));

  console.log('Clicking Run...');
  const runBtn = page.locator('button:has-text("Run")').last();
  await runBtn.click();

  console.log('Waiting for generation...');
  let elapsed = 0;
  let newImgSrc = null;
  while (elapsed < 60000) {
    await page.waitForTimeout(2000);
    elapsed += 2000;
    process.stdout.write(`.${elapsed / 1000}s `);

    const isGenerating = await page.locator('button:has-text("Stop"), [aria-label*="Stop"]').count() > 0;
    const currentImgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => img.naturalWidth >= 200)
        .map(img => img.src);
    });
    const diff = currentImgs.filter(src => !prevImgs.includes(src));
    if (diff.length > 0 && !isGenerating) {
      newImgSrc = diff[diff.length - 1];
      console.log('\nFound image!');
      break;
    }
  }

  if (newImgSrc) {
    const base64Data = await page.evaluate(async (src) => {
      const img = document.querySelector(`img[src="${src}"]`) || document.querySelector('img[src*="blob:"], img[src*="googleusercontent"]');
      if (!img) return null;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return {
        data: canvas.toDataURL('image/jpeg', 0.95).replace(/^data:image\/jpeg;base64,/, ''),
        w: img.naturalWidth,
        h: img.naturalHeight
      };
    }, newImgSrc);

    if (base64Data && base64Data.data) {
      const buf = Buffer.from(base64Data.data, 'base64');
      const outPath = path.join(ARTIFACTS_DIR, 'test_ref_mascot.jpg');
      fs.writeFileSync(outPath, buf);
      console.log(`Saved: ${outPath} (${base64Data.w}x${base64Data.h})`);
    }
  } else {
    console.log('No image generated.');
  }

  process.exit(0);
})();
