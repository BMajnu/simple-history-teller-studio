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

  // Navigate directly to API keys page for account 0
  await page.goto('https://aistudio.google.com/u/0/apikey', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const createBtn = page.locator('button:has-text("Create API key")').first();
  console.log('Create API key button count:', await createBtn.count());
  if (await createBtn.count() > 0) {
    console.log('Clicking Create API key...');
    await createBtn.click();
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: path.join(__dirname, 'after_click_create_api_key.png') });

  const texts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('mat-dialog-container *, .cdk-overlay-container *'))
      .map(e => e.innerText ? e.innerText.trim() : '')
      .filter(t => t.length > 0 && t.length < 100);
  });
  console.log('Overlay texts after click:\n', [...new Set(texts)].slice(0, 30));

  await ctx.close();
  console.log('Done test.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
