const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Testing stealth login on Google...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, // Wait! Can we test with --headless=new?
    executablePath: CHROME_PATH,
    args: [
      '--headless=new',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--disable-dev-shm-usage',
      '--window-size=1280,800',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    ],
    viewport: { width: 1280, height: 800 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  // Stealth evasions
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    window.chrome = {
      app: { isInstalled: false },
      runtime: {},
      loadTimes: function() {},
      csi: function() {}
    };
  });

  console.log('Navigating to accounts.google.com...');
  await page.goto('https://accounts.google.com/ServiceLogin?service=mail', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(2000);

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());

  const emailInput = page.locator('input#identifierId, input[name="identifier"], input[type="email"]').first();
  if (await emailInput.count() > 0) {
    console.log('Found email input! Simulating human click and typing...');
    await emailInput.click({ delay: 100 });
    await page.waitForTimeout(400);

    // Type with human delay
    const email = 'msrosyafrin@gmail.com';
    for (const char of email) {
      await page.keyboard.type(char, { delay: Math.floor(Math.random() * 80) + 40 });
    }
    await page.waitForTimeout(800);

    const nextBtn = page.locator('#identifierNext, button:has-text("Next")').first();
    console.log('Moving mouse to Next button and clicking...');
    await nextBtn.hover();
    await page.waitForTimeout(200);
    await nextBtn.click({ delay: 150 });

    console.log('Waiting for response...');
    await page.waitForTimeout(5000);

    console.log('After email URL:', page.url());
    console.log('After email Title:', await page.title());

    const passInput = page.locator('input[type="password"], input[name="Passwd"], input[name="password"]').first();
    if (await passInput.count() > 0) {
      console.log('SUCCESS! Password field appeared! Typing password...');
      await passInput.click({ delay: 100 });
      await page.waitForTimeout(400);

      const pass = 'BM@jnu78650';
      for (const char of pass) {
        await page.keyboard.type(char, { delay: Math.floor(Math.random() * 80) + 40 });
      }
      await page.waitForTimeout(800);

      const passNext = page.locator('#passwordNext, button:has-text("Next")').first();
      await passNext.hover();
      await page.waitForTimeout(200);
      await passNext.click({ delay: 150 });

      console.log('Waiting for authentication...');
      await page.waitForTimeout(8000);

      console.log('Final URL:', page.url());
      console.log('Final Title:', await page.title());
    } else {
      console.log('Password field did NOT appear. Page text snippet:');
      const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
      console.log(text.replace(/\n+/g, ' '));
    }
  }

  const shotPath = path.join(__dirname, 'stealth_login_result.png');
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot to:', shotPath);

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Stealth error:', err);
  process.exit(1);
});
