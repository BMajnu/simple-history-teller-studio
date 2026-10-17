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
  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Find the button with key or "Get API key"
  const keyBtn = page.locator('button[aria-label="Get API key"], button:has-text("Get API key"), button:has-text("key")').first();
  console.log('Key button text:', await keyBtn.innerText().catch(() => 'none'));
  await keyBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(__dirname, 'api_key_dialog.png') });
  console.log('Saved api_key_dialog.png');

  const text = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.cdk-overlay-container *, mat-dialog-container *'))
      .map(e => e.innerText ? e.innerText.trim() : '')
      .filter(t => t.length > 0 && t.length < 80);
  });
  console.log('Dialog texts:', [...new Set(text)].slice(0, 30));

  await ctx.close();
  console.log('Done.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
