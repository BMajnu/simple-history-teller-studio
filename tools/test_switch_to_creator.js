const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Instagram Settings/Edit...');
  await page.goto('https://www.instagram.com/accounts/edit/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, span, div[role="button"]')).map(el => el.innerText.trim()).filter(t => t.toLowerCase().includes('professional') || t.toLowerCase().includes('creator') || t.toLowerCase().includes('switch') || t.toLowerCase().includes('account type'));
  });
  console.log('Relevant settings links:', links);

  // Check left menu items under Settings
  const menuItems = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="listitem"], a[role="link"], span')).map(el => el.innerText.trim()).filter(Boolean);
  });
  console.log('Settings menu items (sample):', menuItems.slice(0, 30));

  await page.close();
  process.exit(0);
})();
