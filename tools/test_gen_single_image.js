const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REF_STICKY = path.resolve('references/ref_host_sticky_meme.jpg');

const testPrompt = `Sticky-Meme cutout cartoon style, Time Chronicler, the bald elderly human scholar with long white beard, round glasses and brown robe holding torch and ancient book, leaning close in his cosmic library at night whispering to camera with finger on lips, glowing question marks floating above ancient bookshelves, warm lamp glow --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, no clock face, no clock head, no egg head`;

(async () => {
  console.log('Launching Chrome to test single image generation...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  console.log('Navigating to AI Studio new_chat with gemini-3.1-flash-image...');
  await page.goto('https://aistudio.google.com/u/1/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Take screenshot of initial state
  await page.screenshot({ path: 'tools/debug_img_init.png' });

  // Attach reference image if file input is available
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0 && fs.existsSync(REF_STICKY)) {
    console.log('Attaching reference image ref_host_sticky_meme.jpg...');
    await fileInput.setInputFiles(REF_STICKY);
    await page.waitForTimeout(2000);
  }

  // Find prompt textarea
  const ta = page.locator('textarea, div[contenteditable="true"][role="textbox"]').first();
  await ta.waitFor({ state: 'visible', timeout: 15000 });
  await ta.fill(testPrompt);
  await page.waitForTimeout(1000);

  // Take screenshot before run
  await page.screenshot({ path: 'tools/debug_img_filled.png' });

  // Click Run button or press Ctrl+Enter
  console.log('Submitting prompt (Ctrl+Enter)...');
  await page.keyboard.press('Control+Enter');

  // Wait for generation
  console.log('Waiting for image output (up to 45s)...');
  let foundSrc = null;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(3000);
    const imgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => img.naturalWidth >= 400 && !img.src.includes('avatar') && !img.src.includes('googleusercontent.com/a/'))
        .map(img => ({ src: img.src, w: img.naturalWidth, h: img.naturalHeight }));
    });
    if (imgs.length > 0) {
      console.log('Found generated image:', imgs[imgs.length - 1]);
      foundSrc = imgs[imgs.length - 1].src;
      break;
    }
  }

  await page.screenshot({ path: 'tools/debug_img_after.png' });

  if (foundSrc) {
    const imgData = await page.evaluate(async (src) => {
      const res = await fetch(src);
      const blob = await res.blob();
      const ab = await blob.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let bin = '';
      for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
      return btoa(bin);
    }, foundSrc);

    const outPath = 'projects/simple_itihash_002_first_language/visual_assets/shot_0002.jpg';
    fs.writeFileSync(outPath, Buffer.from(imgData, 'base64'));
    console.log(`SUCCESS! Saved test image to ${outPath} (${(imgData.length * 0.75 / 1024).toFixed(0)} KB)`);
  } else {
    console.log('No image found yet. Inspect debug_img_after.png');
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
