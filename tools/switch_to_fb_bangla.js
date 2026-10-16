const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('facebook.com')) || ctx.pages()[0];

  console.log('Navigating to facebook.com home...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click shortcut for "Simple History Teller Bangla" on left sidebar
  console.log('Looking for Simple History Teller Bangla in shortcuts...');
  const banglaShortcut = page.locator('a[role="link"]:has-text("Simple History Teller Bangla"), span:has-text("Simple History Teller Bangla")').first();
  if (await banglaShortcut.isVisible()) {
    console.log('Clicking Bangla shortcut...');
    await banglaShortcut.click();
    await page.waitForTimeout(5000);
    console.log('Current URL after shortcut click:', page.url());
    await page.screenshot({ path: 'tools/fb_bangla_after_click.png' });
    console.log('Saved tools/fb_bangla_after_click.png');
  } else {
    console.log('Shortcut not visible, clicking top right avatar to switch profile...');
    const topAvatar = page.locator('div[aria-label="Your profile"][role="button"], svg[aria-label="Your profile"]').first();
    await topAvatar.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/fb_top_avatar_menu.png' });
    console.log('Saved tools/fb_top_avatar_menu.png');
  }

  process.exit(0);
})();
