const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.instagram.com/accounts/edit/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const item = page.locator('span:text-is("Account type and tools"), a:has-text("Account type and tools")').first();
  if (await item.isVisible()) {
    console.log('Clicking Account type and tools...');
    await item.click();
    await page.waitForTimeout(3000);

    console.log('URL now:', page.url());
    await page.screenshot({ path: 'tools/ig_account_type_tools.png' });
    console.log('Saved tools/ig_account_type_tools.png');

    const options = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('span, a, button, div[role="button"]')).map(el => el.innerText.trim()).filter(Boolean);
    });
    console.log('Options on page:', options.filter(t => t.toLowerCase().includes('switch') || t.toLowerCase().includes('professional') || t.toLowerCase().includes('page') || t.toLowerCase().includes('creator')));
  }

  await page.close();
  process.exit(0);
})();
