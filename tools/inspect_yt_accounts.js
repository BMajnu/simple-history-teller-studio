const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to youtube.com...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatarBtn = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatarBtn.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার"), ytd-compact-link-renderer:has-text("अकाउंट बदलें")').first();
  if (await switchItem.isVisible().catch(() => false)) {
    await switchItem.click();
    await page.waitForTimeout(2000);

    const accounts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ytd-account-item-renderer, ytd-account-item-section-renderer')).map(el => el.innerText.trim().replace(/\n/g, ' '));
    });
    console.log('Accounts found:', accounts);
  } else {
    console.log('Switch account menu item not found');
  }

  await page.close();
  process.exit(0);
})();
