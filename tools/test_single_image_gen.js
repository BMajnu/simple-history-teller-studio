const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    console.log('Navigating to gemini-3.1-flash-image on /u/1/...');
    await page.goto('https://aistudio.google.com/u/1/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // Dismiss any modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Set Aspect ratio to 16:9
    const arSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
    if (await arSelect.count() > 0) {
      console.log('Configuring Aspect ratio 16:9...');
      await arSelect.click();
      await page.waitForTimeout(600);
      const opt169 = page.locator('mat-option:has-text("16:9")').first();
      if (await opt169.count() > 0) await opt169.click();
      await page.waitForTimeout(400);
    }

    // Set Resolution to 1K
    const resSelect = page.locator('mat-select[aria-label="Resolution"]').first();
    if (await resSelect.count() > 0) {
      console.log('Configuring Resolution 1K...');
      await resSelect.click();
      await page.waitForTimeout(600);
      const opt1k = page.locator('mat-option:has-text("1K")').first();
      if (await opt1k.count() > 0) await opt1k.click();
      await page.waitForTimeout(400);
    }

    const testPrompt = 'OverSimplified cartoon sticky meme style: The podium president with an enormous white mustache slamming a huge wooden gavel down onto a stack of academic papers, clean flat 2D vector, bold solid outlines, vibrant color, 16:9 widescreen --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks';
    
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
          .filter(img => img.naturalWidth >= 300)
          .map(img => img.src);
      });
      const diff = currentImgs.filter(src => !prevImgs.includes(src));
      if (diff.length > 0 && !isGenerating) {
        newImgSrc = diff[diff.length - 1];
        console.log('\nFound newly generated image!');
        break;
      }
    }

    if (!newImgSrc) {
      console.log('\nTimed out or no image found. Taking debug screenshot...');
      await page.screenshot({ path: 'tools/debug_image_timeout.png' });
    } else {
      console.log('Extracting image base64 data...');
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
        const testOut = path.join(__dirname, 'test_output_shot16.jpg');
        fs.writeFileSync(testOut, buf);
        console.log(`Success! Saved test image: ${testOut} (${base64Data.w}x${base64Data.h}, ${buf.length} bytes)`);
      } else {
        console.log('Failed to extract base64 from image element.');
      }
    }

    await page.close();
  } catch (err) {
    console.error('Error during test generation:', err);
  }
  process.exit(0);
})();
