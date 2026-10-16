const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Channel 3 public URL...');
  await page.goto('https://www.youtube.com/@SimpleHistoryTellerHindi', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Hard reload to bypass cache
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/c3_public_verified_fresh.png' });
  console.log('Saved tools/c3_public_verified_fresh.png');

  // Check channel title and description
  const title = await page.title();
  console.log('Page Title:', title);

  const descSnippet = await page.locator('#description-container, yt-description-preview-view-model, #description').first().innerText().catch(() => '');
  console.log('Description snippet:', descSnippet);

  await page.close();
  process.exit(0);
})();
