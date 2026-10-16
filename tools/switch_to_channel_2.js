const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();
  console.log('Going to youtube.com to switch to Channel 2 (Bangla)...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatarBtn = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatarBtn.click();
  await page.waitForTimeout(2000);

  const switchItem = page.locator('ytd-compact-link-renderer').filter({
    hasText: /Switch account|অন্য অ্যাকাউন্ট|অ্যাকাউন্ট পরিবর্তন/i
  }).first();

  if (await switchItem.isVisible()) {
    console.log('Clicking Switch account...');
    await switchItem.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/yt_switch_options.png' });

  // List all available channel/account titles
  const items = await page.locator('ytd-account-item-renderer').all();
  console.log(`Found ${items.length} accounts:`);
  let clicked = false;
  for (let item of items) {
    const text = (await item.innerText()).trim();
    console.log(' - Option:', text.replace(/\n+/g, ' | '));
    if (text.includes('Bangla') || text.includes('বাংলা') || text.includes('bmajnu981')) {
      console.log('>>> Switching to this account!');
      await item.click();
      clicked = true;
      await page.waitForTimeout(4000);
      break;
    }
  }

  // Now verify studio
  console.log('Navigating to Studio...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('Final URL:', page.url());
  await page.screenshot({ path: 'tools/yt_channel2_studio.png' });

  await page.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
