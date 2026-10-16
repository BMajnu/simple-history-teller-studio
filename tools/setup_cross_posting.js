const { chromium } = require('playwright-core');

(async () => {
  console.log('=== CONFIGURING CONNECTED EXPERIENCES / CROSS SHARING ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://accountscenter.facebook.com/connected_experiences/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'tools/meta_connected_experiences.png' });
  console.log('Saved tools/meta_connected_experiences.png. URL:', page.url());

  const text = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Connected experiences text:\n', text);

  // Look for "Sharing across profiles"
  const shareOpt = page.locator('text=Sharing across profiles, a[href*="cross_app_sharing"], div[role="button"]:has-text("Sharing across profiles")').first();
  if (await shareOpt.isVisible().catch(() => false)) {
    console.log('Clicking Sharing across profiles...');
    await shareOpt.click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tools/meta_sharing_across_profiles.png' });
    console.log('Saved tools/meta_sharing_across_profiles.png');
  }

  await page.close();
  process.exit(0);
})();
