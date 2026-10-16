const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  // Switch to bmajnu9811@gmail.com
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const section = page.locator('ytd-account-item-section-renderer').filter({ hasText: 'bmajnu9811@gmail.com' }).first();
  if (await section.count() > 0) {
    const item = section.locator('ytd-account-item-renderer, #channel-title').first();
    await item.click();
    await page.waitForTimeout(4000);
  }

  // Open Studio
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  console.log('Channel 3 Studio URL:', page.url());
  await page.screenshot({ path: 'tools/c3_studio_url.png' });

  await page.close();
}

main().catch(console.error);
