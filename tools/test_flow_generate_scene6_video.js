const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Testing Scene 6 Video Generation on Google Flow...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  await page.goto('https://flow.google.com/project/fe696efb-895e-4a23-b95d-582220360465', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // 1. Click Settings trigger
  const settingsBtn = page.locator('button[aria-label="Settings trigger"], button:has-text("Nano Banana"), button:has-text("crop_16_9")').first();
  console.log('Clicking settings trigger...');
  await settingsBtn.click();
  await page.waitForTimeout(1000);

  // 2. Select Video
  const videoBtn = page.locator('button:has-text("Video"), [role="tab"]:has-text("Video")').first();
  if (await videoBtn.count() > 0) {
    console.log('Selecting Video mode...');
    await videoBtn.click();
    await page.waitForTimeout(1000);
  }

  // 3. Select 16:9
  const ar169 = page.locator('button:has-text("16:9")').first();
  if (await ar169.count() > 0) {
    await ar169.click();
    await page.waitForTimeout(500);
  }

  // Close menu with Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 4. Fill prompt into ProseMirror
  const prompt = 'Dynamic 2D animation in Simple History graphic novel style. A sleek Mycenaean wooden war galley with bold painted eye at the prow cutting through foaming turquoise Aegean sea waves, bronze-clad oarsmen pulling rhythmically, 24fps motion. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients';

  console.log('Entering prompt into ProseMirror...');
  const pm = page.locator('div.ProseMirror').first();
  await pm.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type(prompt, { delay: 5 });
  await page.waitForTimeout(1000);

  // Screenshot before clicking generate
  await page.screenshot({ path: path.join(__dirname, 'flow_before_generate.png') });
  console.log('Saved flow_before_generate.png');

  // 5. Click Start generation
  const startBtn = page.locator('button[aria-label="Start generation"], button:has-text("arrow_forward")').first();
  console.log('Clicking Start generation (arrow_forward)...');
  await startBtn.click();
  await page.waitForTimeout(5000);

  await page.screenshot({ path: path.join(__dirname, 'flow_after_generate.png') });
  console.log('Saved flow_after_generate.png');

  // Check state of the page
  const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Page snippet after generate:', text.replace(/\n+/g, ' '));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
