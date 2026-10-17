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
  await page.goto('https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const keyBtn = page.locator('button[aria-label="Get API key"]').first();
  await keyBtn.click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(__dirname, 'u1_apikey_dialog.png') });

  const text = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.cdk-overlay-container *, mat-dialog-container *'))
      .map(e => e.innerText ? e.innerText.trim() : '')
      .filter(t => t.length > 0 && t.length < 80);
  });
  console.log('Dialog texts:', [...new Set(text)].slice(0, 30));
  await ctx.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
