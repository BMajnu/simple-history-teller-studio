const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const REFERENCE_IMG = path.join(ARTIFACTS_DIR, 'history_mascot_02_torch_stone_arch_ruins.jpg');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('aistudio')) || await ctx.newPage();

  console.log('Navigating to AI Studio for 16:9 Banner Background...');
  await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Clear modals
  await page.evaluate(() => {
    document.querySelectorAll('.cdk-overlay-container, .cdk-overlay-backdrop').forEach(el => el.remove());
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Set Aspect ratio to 16:9
  const arSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
  if (await arSelect.count() > 0) {
    const txt = await arSelect.innerText();
    if (!txt.includes('16:9')) {
      await arSelect.click();
      await page.waitForTimeout(500);
      const opt169 = page.locator('mat-option:has-text("16:9")').first();
      if (await opt169.count() > 0) await opt169.click();
      await page.waitForTimeout(300);
    }
  }

  // Upload Concept 2 as reference
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    console.log('Uploading Concept 2 mascot as style reference...');
    await fileInput.setInputFiles(REFERENCE_IMG);
    await page.waitForTimeout(2500);
  }

  const prompt = 'Epic panoramic YouTube channel banner background in the exact 2D cartoon animation art style and color palette of the reference image. A breathtaking wide landscape of ancient world history at twilight: majestic ancient stone ruins with carved rune arches, towering classical Greco-Roman pillars, distant Egyptian pyramids under a deep navy cosmic night sky filled with glowing stars and galaxies. Warm golden torchlight glowing on stone pavements, ancient leatherbound history tomes and scrolls scattered tastefully. Clean 2D cartoon line art with bold outlines and rich warm lighting, wide panoramic composition, spacious clean center area for banner text, 16:9 widescreen --no modern elements, no photorealism, no 3d';

  const prevImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(img => img.src));

  const textarea = page.locator('textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(400);

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
        .filter(img => img.naturalWidth >= 300)
        .map(img => img.src);
    });
    const diff = currentImgs.filter(src => !prevImgs.includes(src));
    if (diff.length > 0 && !isGenerating) {
      newImgSrc = diff[diff.length - 1];
      console.log('\nFound generated banner background!');
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
      const outPath = path.join(ARTIFACTS_DIR, 'banner_background_raw.jpg');
      fs.writeFileSync(outPath, buf);
      console.log(`Saved: ${outPath} (${base64Data.w}x${base64Data.h})`);
    }
  }

  process.exit(0);
})();
