const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  page.on('response', async res => {
    if (res.url().includes('GenerateContent')) {
      console.log('GenerateContent HTTP Status:', res.status());
      try {
        const text = await res.text();
        console.log('Body snippet:', text.slice(0, 180));
      } catch (e) {}
    }
  });

  console.log('Navigating to gemini-3.8-flash-lite-tts...');
  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-lite-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('Page Title:', await page.title());
  console.log('Page URL:', page.url());

  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  if (await card.count() > 0) {
    await card.click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  const ta = page.locator('textarea').first();
  await ta.fill('I am the Time Chronicler, taking you back thirty-two hundred years.');
  await page.waitForTimeout(500);

  const runBtn = page.locator('button:has-text("Run")').first();
  await runBtn.click();
  await page.waitForTimeout(8000);

  await page.screenshot({ path: path.join(__dirname, 'flash_lite_tts_result.png') });
  console.log('Saved flash_lite_tts_result.png');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
