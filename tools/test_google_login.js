const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Launching browser with profile:', PROFILE_DIR);
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--window-size=1280,800'
    ],
    viewport: { width: 1280, height: 800 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  console.log('Navigating to accounts.google.com...');
  await page.goto('https://accounts.google.com/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('Current URL:', page.url());
  const emailInput = page.locator('input#identifierId, input[name="identifier"], input[type="email"], input').first();
  if (await emailInput.count() > 0) {
    console.log('Found email input, typing email msrosyafrin@gmail.com...');
    await emailInput.click();
    await emailInput.fill('msrosyafrin@gmail.com');
    await page.waitForTimeout(600);

    const nextBtn = page.locator('#identifierNext, button:has-text("Next"), div[role="button"]:has-text("Next")').first();
    console.log('Clicking Next...');
    await nextBtn.click();
    await page.waitForTimeout(5000);

    console.log('After email next URL:', page.url());
    console.log('After email title:', await page.title());

    // Check for password input
    const passInput = page.locator('input[type="password"], input[name="Passwd"], input[name="password"]').first();
    if (await passInput.count() > 0) {
      console.log('Found password input! Typing password...');
      await passInput.click();
      await passInput.fill('BM@jnu78650');
      await page.waitForTimeout(600);

      const passNext = page.locator('#passwordNext, button:has-text("Next"), div[role="button"]:has-text("Next")').first();
      console.log('Clicking Password Next...');
      await passNext.click();
      await page.waitForTimeout(8000);

      console.log('After login URL:', page.url());
      console.log('After login title:', await page.title());
    } else {
      console.log('Password input NOT found. Check text/screenshot.');
      const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
      console.log('Body snippet:', text.replace(/\n+/g, ' '));
    }
  }

  const screenshotPath = path.join(__dirname, 'login_step2_result.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
