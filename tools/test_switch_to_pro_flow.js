const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.instagram.com/accounts/account_type_and_tools/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const switchBtn = page.locator('span:text-is("Switch to professional account"), div:has-text("Switch to professional account")').first();
  console.log('Clicking Switch to professional account...');
  await switchBtn.click();
  await page.waitForTimeout(3000);

  console.log('URL now:', page.url());
  await page.screenshot({ path: 'tools/ig_switch_pro_modal.png' });
  console.log('Saved tools/ig_switch_pro_modal.png');

  const modalButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, div[role="button"]')).map(el => el.innerText.trim()).filter(Boolean);
  });
  console.log('Modal buttons:', modalButtons);

  await page.close();
  process.exit(0);
})();
