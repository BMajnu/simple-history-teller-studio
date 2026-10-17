const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1200, height: 800 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  page.on('request', req => {
    if (req.url().includes('GenerateContent')) {
      console.log('GenerateContent post data:', req.postData());
    }
  });

  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  if (await card.count() > 0) {
    await card.click();
    await page.waitForTimeout(2000);
  }

  // Click Style button
  const styleBtn = page.locator('button:has-text("Style")').first();
  console.log('Style button count:', await styleBtn.count());
  await styleBtn.click();
  await page.waitForTimeout(1000);

  // Find style textarea
  const styleTa = page.locator('textarea[placeholder*="Describe the voice style"], textarea[aria-label="Describe the voice style"]').first();
  console.log('Style textarea count:', await styleTa.count());
  if (await styleTa.count() > 0) {
    await styleTa.fill('An Old Story Teller, Old Man voice');
    await page.waitForTimeout(500);
    // Is there an apply button or enter key?
    const applyBtn = page.locator('.cdk-overlay-container button:has-text("Apply"), .cdk-overlay-container button:has-text("Save"), .cdk-overlay-container button:has-text("Done")').first();
    if (await applyBtn.count() > 0) {
      console.log('Clicking style apply button...');
      await applyBtn.click();
    } else {
      console.log('Pressing Enter...');
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: path.join(__dirname, 'after_style_set.png') });
  console.log('Saved after_style_set.png');

  // Fill text and run
  const ta = page.locator('textarea').first();
  await ta.fill('আজ থেকে ৩২০০ বছর আগে...');
  await page.waitForTimeout(500);

  const runBtn = page.locator('button:has-text("Run")').first();
  await runBtn.click();
  await page.waitForTimeout(6000);

  await ctx.close();
  console.log('Done test_set_style.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
