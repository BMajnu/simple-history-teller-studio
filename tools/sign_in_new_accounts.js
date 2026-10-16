const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    
    console.log('Navigating to Google AddSession for msrosyafrin@gmail.com...');
    await page.goto('https://accounts.google.com/ServiceLogin?continue=https://aistudio.google.com/&flowEntry=AddSession', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      console.log('Entering email msrosyafrin@gmail.com...');
      await emailInput.fill('msrosyafrin@gmail.com');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(4000);

      const passInput = page.locator('input[type="password"]');
      if (await passInput.count() > 0) {
        console.log('Entering password...');
        await passInput.fill('***REMOVED***');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
      }
    }

    console.log('Current URL after sign in attempt:', page.url());
    await page.screenshot({ path: 'tools/after_sign_in_msrosyafrin.png' });
    console.log('Saved tools/after_sign_in_msrosyafrin.png');
    await page.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
