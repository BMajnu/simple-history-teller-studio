const { chromium } = require('playwright-core');

(async () => {
  console.log('=== FILLING & CREATING FACEBOOK PAGE ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.log('No pages/create page found');
    process.exit(1);
  }

  // 1. Fill Page Name
  console.log('Filling Page Name...');
  const nameInput = p.locator('input[type="text"]').first();
  await nameInput.click({ force: true });
  await p.keyboard.type('Simple History Teller', { delay: 40 });
  await p.waitForTimeout(500);

  // 2. Fill Category
  console.log('Filling Category...');
  const catInput = p.locator('input[aria-label*="Category"]').first();
  await catInput.click({ force: true });
  await p.keyboard.type('Digital creator', { delay: 50 });
  await p.waitForTimeout(2000);

  // Pick category from dropdown
  console.log('Selecting category option...');
  const option = p.locator('div[role="listbox"] div[role="option"], ul[role="listbox"] li, div[role="option"]').first();
  if (await option.isVisible().catch(() => false)) {
    await option.click({ force: true });
    await p.waitForTimeout(1000);
  } else {
    // If not visible by locator, try evaluate click
    await p.evaluate(() => {
      const opt = document.querySelector('[role="option"]');
      if (opt) opt.click();
    });
    await p.waitForTimeout(1000);
  }

  // 3. Fill Bio
  console.log('Filling Bio...');
  const bioInput = p.locator('textarea').first();
  await bioInput.click({ force: true });
  await p.keyboard.type('🏛️ Unraveling history through animation! ⏰ New Episode every 2 days 📺 YouTube: @SimpleHistoryTellerOfficial', { delay: 20 });
  await p.waitForTimeout(1000);

  await p.screenshot({ path: 'tools/fb_page_filled_verified.png' });
  console.log('Saved tools/fb_page_filled_verified.png');

  // 4. Click Create Page
  console.log('Clicking Create Page...');
  const createBtn = p.locator('div[aria-label="Create Page"], div[role="button"]:has-text("Create Page")').first();
  await createBtn.click({ force: true });
  console.log('Clicked Create Page, waiting 10s...');
  await p.waitForTimeout(10000);

  await p.screenshot({ path: 'tools/fb_page_created_result.png' });
  console.log('Saved tools/fb_page_created_result.png. URL:', p.url());

  const postText = await p.evaluate(() => document.body.innerText.slice(0, 600));
  console.log('Post text:', postText);

  process.exit(0);
})();
