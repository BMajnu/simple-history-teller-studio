const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to youtube.com...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatarBtn = page.locator('#avatar-btn').first();
  if (await avatarBtn.isVisible()) {
    console.log('Clicking avatar button...');
    await avatarBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/avatar_menu.png' });

    const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট"), ytd-compact-link-renderer:has-text("অ্যাকাউন্ট পরিবর্তন"), ytd-compact-link-renderer:has-text("अकाउंट बदलें")').first();
    console.log('Switch item count:', await switchItem.count());
    if (await switchItem.isVisible()) {
      await switchItem.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: 'tools/accounts_list.png' });

      const accounts = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('ytd-account-item-renderer, ytd-account-item-section-renderer, #account-name, #email'));
        return items.map(el => el.innerText.trim()).filter(Boolean);
      });
      console.log('Available accounts/text:', accounts);
    }
  } else {
    console.log('Avatar button not visible!');
    await page.screenshot({ path: 'tools/no_avatar.png' });
  }

  await page.close();
  process.exit(0);
})();
