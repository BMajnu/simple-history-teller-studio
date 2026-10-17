const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Testing headed browser under PRO subscription...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1280, height: 800 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('GenerateContent')) {
      console.log(`[GenerateContent Status]`, res.status());
      try {
        const body = await res.text();
        console.log(`[GenerateContent Body]`, body.slice(0, 300));
      } catch (e) {}
    }
  });

  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  if (await card.count() > 0) {
    await card.click();
    await page.waitForTimeout(2000);
  }

  const ta = page.locator('textarea').first();
  await ta.click();
  await ta.fill('Three thousand years ago, the great civilizations fell.');
  await page.waitForTimeout(1000);

  console.log('Clicking Run button...');
  const runBtn = page.locator('button:has-text("Run")').first();
  await runBtn.click();

  // Wait 10 seconds to observe response
  await page.waitForTimeout(10000);

  await page.screenshot({ path: path.join(__dirname, 'headed_test_result.png') });
  console.log('Saved headed_test_result.png');

  await ctx.close();
  console.log('Done headed test.');
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
