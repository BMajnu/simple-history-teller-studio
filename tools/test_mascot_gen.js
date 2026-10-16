const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = ctx.pages().find(p => p.url().includes('aistudio')) || await ctx.newPage();

    console.log('Navigating to gemini-3.1-flash-image in AI Studio...');
    await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // Dismiss any modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Set Aspect ratio to 1:1
    const arSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
    if (await arSelect.count() > 0) {
      console.log('Setting Aspect ratio to 1:1...');
      await arSelect.click();
      await page.waitForTimeout(600);
      const opt11 = page.locator('mat-option:has-text("1:1")').first();
      if (await opt11.count() > 0) await opt11.click();
      await page.waitForTimeout(400);
    } else {
      console.log('Aspect ratio select not found or already default');
    }

    const testPrompt = 'Minimalist modern mascot logo of a cartoon history chronicler, featuring the bold monogram letters SHT. Clean flat vector graphic, sharp elegant outlines, single character icon, royal blue and gold colors, circular badge emblem, professional branding --no photographic realism, 3d, clutter';
    
    console.log('Filling prompt...');
    const textarea = page.locator('textarea').first();
    await textarea.fill(testPrompt);
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
        console.log('\nFound generated image!');
        break;
      }
    }

    if (!newImgSrc) {
      console.log('\nTaking debug screenshot...');
      const debugShot = path.join(__dirname, 'debug_mascot_aistudio.png');
      await page.screenshot({ path: debugShot });
      console.log('Saved debug screenshot to:', debugShot);
    } else {
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
        const outPath = path.join(__dirname, 'test_minimalist_mascot.jpg');
        fs.writeFileSync(outPath, buf);
        console.log(`Success! Saved mascot image: ${outPath} (${base64Data.w}x${base64Data.h})`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
