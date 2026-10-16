const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    console.log('Navigating to flow.google.com...');
    await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // Click on "নতুন প্রজেক্ট" or first project tile
    const newProjBtn = page.locator('text="নতুন প্রজেক্ট", [aria-label*="নতুন প্রজেক্ট"], .project-card').first();
    console.log('Looking for project button...');
    if (await newProjBtn.count() > 0) {
      console.log('Clicking project tile/button...');
      await newProjBtn.click();
      await page.waitForTimeout(4000);
      console.log('Current URL after click:', page.url());
      await page.screenshot({ path: 'tools/test_flow_inside_project.png' });
    }

    await page.close();
  } catch (err) {
    console.error('Flow project test error:', err.message);
  }
  process.exit(0);
})();
