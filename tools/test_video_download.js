const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'visual_assets');

async function testDownload() {
  console.log('Connecting to browser on 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Omni 1.1 Flash...');
  await page.goto('https://aistudio.google.com/app/prompts/new_chat?model=gemini-omni-1.1-flash', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Set Aspect Ratio to 16:9
  const aspectSelect = page.locator('mat-select, [role="combobox"]').filter({ hasText: 'Auto' }).first();
  if (await aspectSelect.count() > 0) {
    await aspectSelect.click();
    await page.waitForTimeout(500);
    const option169 = page.locator('mat-option:has-text("16:9"), [role="option"]:has-text("16:9")').first();
    if (await option169.count() > 0) {
      await option169.click();
      await page.waitForTimeout(500);
      console.log('Aspect ratio set to 16:9');
    }
  }

  // Upload shot_0005.jpg
  const refImage = path.join(VISUAL_DIR, 'shot_0005.jpg');
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
  const prompt = 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: The caveman opens his mouth wide in wonder, golden question marks softly floating up into the dawn sky, wind gently blowing his wild hair, 2D cartoon animation style, smooth 24fps motion.';
  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(500);

  console.log('Clicking Run...');
  const runBtn = page.locator('button:has-text("Run"), button.ctrl-enter-submits').first();
  await runBtn.click();

  // Wait for video element
  console.log('Waiting for video generation...');
  let videoSrc = null;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => {
      const vid = document.querySelector('video');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      return {
        hasVid: !!vid && !!vid.src,
        src: vid ? vid.src : null,
        hasStop: stop
      };
    });

    console.log(`[${(i+1)*3}s] StopBtn: ${state.hasStop} | Video: ${state.hasVid}`);
    if (state.hasVid && !state.hasStop) {
      videoSrc = state.src;
      console.log('Generation completed! Video src:', videoSrc);
      break;
    }
  }

  if (!videoSrc) {
    throw new Error('Video generation timed out or failed!');
  }

  // Method 1: Extract blob data via browser fetch and base64
  console.log('Extracting video blob from browser memory...');
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

  const outFile = path.join(VISUAL_DIR, 'clip_shot_0005.mp4');
  const buffer = Buffer.from(videoBase64, 'base64');
  fs.writeFileSync(outFile, buffer);
  console.log(`Saved video to ${outFile} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  await page.screenshot({ path: 'tools/download_success.png' });
  await page.close();
}

testDownload().catch(console.error);
