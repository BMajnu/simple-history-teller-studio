const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    await page.goto('https://flow.google.com/project/6b6c9890-d01a-498e-840d-d27c7ab94128', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const tiles = page.locator('flow-grid-tile-container');
    await tiles.nth(1).click();
    await page.waitForTimeout(2000);

    const settingsTrigger = page.locator('button:has-text("Nano Banana"), [aria-label*="সেটিংস ট্রিগার"]').first();
    await settingsTrigger.click();
    await page.waitForTimeout(1000);

    const menuItems = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.mat-mdc-menu-item, [role="menuitem"], mat-option, .cdk-overlay-container *')).map(el => ({
        text: (el.innerText || '').slice(0, 50).trim(),
        class: el.className
      })).filter(x => x.text && x.text.length < 50);
    });
    console.log('Settings menu options:', JSON.stringify(menuItems.slice(0, 30), null, 2));

    await page.screenshot({ path: 'tools/test_flow_settings_menu.png' });
    await page.close();
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
