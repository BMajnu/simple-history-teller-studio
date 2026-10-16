const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to facebook.com...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const createBtn = page.locator('a:has-text("Create new account"), button:has-text("Create new account")').first();
  console.log('Clicking Create new account...');
  await createBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/fb_create_dialog.png' });
  console.log('Saved tools/fb_create_dialog.png');

  const fields = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select')).map(el => ({
      name: el.name,
      placeholder: el.placeholder,
      ariaLabel: el.getAttribute('aria-label')
    }));
  });
  console.log('Fields in dialog:', fields);

  await page.close();
  process.exit(0);
})();
