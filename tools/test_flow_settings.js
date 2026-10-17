const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Testing Flow settings modal...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  // Navigate to existing or new project
  await page.goto('https://flow.google.com/project/fe696efb-895e-4a23-b95d-582220360465', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Click Settings trigger
  const settingsBtn = page.locator('button[aria-label="Settings trigger"], button:has-text("Nano Banana")').first();
  console.log('Settings trigger count:', await settingsBtn.count());
  if (await settingsBtn.count() > 0) {
    await settingsBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(__dirname, 'flow_settings_open.png') });
    console.log('Saved flow_settings_open.png');

    const options = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, mat-option, [role="option"], [role="menuitem"], [role="tab"]')).map(el => (el.innerText || el.getAttribute('aria-label') || '').trim()).filter(Boolean);
    });
    console.log('Settings menu options (sample 30):', options.slice(0, 30));
  }

  await ctx.close();
  process.exit(0);
})().catch(console.error);
