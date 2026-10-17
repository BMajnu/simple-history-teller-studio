const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--headless=new', '--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  // Inspect the speech playground with Pro account u/0
  await page.goto('https://aistudio.google.com/u/0/generate-speech', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('URL:', page.url());

  // Click create new dialog
  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  if (await card.count() > 0) {
    await card.click();
    await page.waitForTimeout(2000);
  }

  // Check what models are in the model dropdown
  const modelHeader = page.locator('button:has-text("Gemini"), [aria-label*="model" i], .model-selector-button').first();
  console.log('Model button count:', await modelHeader.count());
  if (await modelHeader.count() > 0) {
    console.log('Model button text:', await modelHeader.innerText());
  }

  // Check what happens if we click expand_more on Model settings
  const expandMore = page.locator('button:has-text("expand_more"), button[aria-label*="Model settings"]').first();
  if (await expandMore.count() > 0) {
    await expandMore.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(__dirname, 'pro_speech_view.png') });
  console.log('Screenshot saved to pro_speech_view.png');

  await ctx.close();
  console.log('Done.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
