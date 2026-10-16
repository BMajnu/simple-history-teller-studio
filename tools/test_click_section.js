const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  // Click switch account
  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  // Find section for bmajnu9811@gmail.com
  const section = page.locator('ytd-account-item-section-renderer').filter({ hasText: 'bmajnu9811@gmail.com' }).first();
  console.log('Found section for bmajnu9811@gmail.com:', await section.count());
  
  if (await section.count() > 0) {
    const item = section.locator('ytd-account-item-renderer, #channel-title, yt-formatted-string#channel-title').first();
    console.log('Clicking item inside bmajnu9811 section...');
    await item.click();
    await page.waitForTimeout(5000);
  }

  console.log('Current URL after click:', page.url());
  await page.screenshot({ path: 'tools/after_switch_9811.png' });

  // Now click avatar again to verify active account
  const av2 = page.locator('#avatar-btn, button#avatar-btn').first();
  await av2.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tools/verified_menu_9811.png' });

  await page.close();
}

main().catch(console.error);
