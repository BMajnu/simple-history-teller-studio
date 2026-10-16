const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to AddSession...');
  await page.goto('https://accounts.google.com/AddSession?continue=https%3A%2F%2Faistudio.google.com%2F', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  const emailInput = page.locator('input#identifierId, input[name="identifier"]');
  console.log('Email input count:', await emailInput.count());

  if (await emailInput.count() > 0) {
    console.log('Filling msrosyafrin@gmail.com...');
    await emailInput.fill('msrosyafrin@gmail.com');
    await page.waitForTimeout(500);

    const nextBtn = page.locator('#identifierNext button, button:has-text("পরবর্তী"), button:has-text("Next")').first();
    await nextBtn.click();
    console.log('Clicked Next, waiting for password...');
    await page.waitForTimeout(4000);

    const passInput = page.locator('input[type="password"], input[name="Passwd"]');
    console.log('Password input count:', await passInput.count());
    if (await passInput.count() > 0) {
      console.log('Filling password...');
      await passInput.fill('***REMOVED***');
      await page.waitForTimeout(500);

      const passNextBtn = page.locator('#passwordNext button, button:has-text("পরবর্তী"), button:has-text("Next")').first();
      await passNextBtn.click();
      console.log('Clicked Next on password...');
      await page.waitForTimeout(6000);
    }
  }

  console.log('Final URL:', page.url());
  await page.screenshot({ path: 'tools/after_login_msrosyafrin.png' });
  await page.close();
})();
