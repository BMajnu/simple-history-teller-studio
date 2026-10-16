const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com'));
  if (!p) {
    console.log('No FB page found');
    process.exit(1);
  }

  console.log('Clicking Badiuzzaman Majnu switch row...');
  const switchTarget = p.locator('div[role="button"]:has-text("Badiuzzaman Majnu"), span:has-text("Badiuzzaman Majnu")').first();
  if (await switchTarget.isVisible().catch(() => false)) {
    await switchTarget.click();
    console.log('Clicked switchTarget');
  } else {
    // If menu closed, reopen and click
    const loc = p.locator('div[aria-label="Your profile"]').first();
    await loc.click();
    await p.waitForTimeout(1000);
    await p.locator('text=Badiuzzaman Majnu').first().click();
  }

  await p.waitForTimeout(5000);
  console.log('Switched! Current URL:', p.url());
  await p.screenshot({ path: 'tools/fb_after_switch_user.png' });
  console.log('Saved tools/fb_after_switch_user.png');

  // Now navigate to pages/create
  console.log('Navigating to https://www.facebook.com/pages/create/ ...');
  await p.goto('https://www.facebook.com/pages/create/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'tools/fb_pages_create_ready.png' });
  console.log('Saved tools/fb_pages_create_ready.png. URL:', p.url());

  process.exit(0);
})();
