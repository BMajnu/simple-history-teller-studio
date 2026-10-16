const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.log('No create page found');
    process.exit(1);
  }

  // Clear and type Page name
  const nameInput = p.locator('input[type="text"]').first();
  await nameInput.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.press('Backspace');
  await p.waitForTimeout(300);
  await p.keyboard.type('Simple History Teller Bangla', { delay: 40 });
  await p.waitForTimeout(1000);

  await p.screenshot({ path: 'tools/fb_c2_name_corrected.png' });
  console.log('Saved tools/fb_c2_name_corrected.png');

  // Click Create Page
  console.log('Clicking Create Page button...');
  const createBtn = p.locator('div[aria-label="Create Page"], div[role="button"]:has-text("Create Page")').first();
  await createBtn.click({ force: true });
  console.log('Waiting 10s...');
  await p.waitForTimeout(10000);

  await p.screenshot({ path: 'tools/fb_c2_after_create_click.png' });
  console.log('Saved tools/fb_c2_after_create_click.png');

  process.exit(0);
})();
