const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);
  
  // Click switch account
  const switchBtn = page.locator('ytd-compact-link-renderer').filter({ hasText: 'অ্যাকাউন্ট' }).nth(1);
  if (await switchBtn.count() > 0) {
    await switchBtn.click();
    await page.waitForTimeout(2000);
  }
  
  await page.screenshot({ path: 'tools/yt_switch_accounts.png' });
  
  const texts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .map(el => (el.innerText || '').trim())
      .filter(t => t.includes('@gmail.com') || t.includes('অ্যাকাউন্ট যোগ') || t.includes('Add account'));
  });
  console.log('Available accounts:', Array.from(new Set(texts)));
  await page.close();
})();
