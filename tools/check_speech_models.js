const { chromium } = require('playwright-core');
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
  await page.goto('https://aistudio.google.com/u/0/generate-speech', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click create new dialog if card exists
  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  if (await card.count() > 0) {
    await card.click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  // Look for the model card or button on the right panel
  const modelCard = page.locator('button:has-text("Gemini 3.8 Flash TTS"), .model-selector-card, button:has-text("Flash TTS")').first();
  console.log('Model card count:', await modelCard.count());
  if (await modelCard.count() > 0) {
    console.log('Model card text:', await modelCard.innerText());
    await modelCard.click().catch(() => {});
    await page.waitForTimeout(1500);
  }

  const models = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.cdk-overlay-container *, [role="menu"] *, [role="listbox"] *'))
      .map(e => e.innerText ? e.innerText.trim() : '')
      .filter(t => t.length > 0 && t.length < 60);
  });
  console.log('Available models in dropdown:', [...new Set(models)].slice(0, 30));

  await page.screenshot({ path: path.join(__dirname, 'speech_models_dropdown.png') });
  console.log('Saved speech_models_dropdown.png');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
