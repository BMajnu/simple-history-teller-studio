const { chromium } = require('playwright-core');

(async () => {
  console.log('=== CREATING FACEBOOK PAGE: SIMPLE HISTORY TELLER ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  await p.goto('https://www.facebook.com/pages/create/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);

  // 1. Page name
  console.log('Filling Page name...');
  const nameInput = p.locator('input[type="text"]').first();
  await nameInput.click();
  await p.keyboard.type('Simple History Teller', { delay: 40 });
  await p.waitForTimeout(500);

  // 2. Category
  console.log('Filling Category...');
  const catInput = p.locator('input[aria-label*="Category"]').first();
  await catInput.click();
  await p.keyboard.type('Digital creator', { delay: 50 });
  await p.waitForTimeout(1500);

  // Select first category result
  const catOption = p.locator('div[role="listbox"] div[role="option"], ul[role="listbox"] li, div[role="option"]:has-text("Digital creator")').first();
  if (await catOption.isVisible().catch(() => false)) {
    console.log('Clicking Digital creator option...');
    await catOption.click();
    await p.waitForTimeout(1000);
  }

  // 3. Bio
  console.log('Filling Bio...');
  const bioInput = p.locator('textarea').first();
  await bioInput.click();
  await p.keyboard.type('🏛️ Unraveling history through animation! ⏰ New Episode every 2 days 📺 YouTube: @SimpleHistoryTellerOfficial', { delay: 20 });
  await p.waitForTimeout(1000);

  await p.screenshot({ path: 'tools/fb_page_filled.png' });
  console.log('Saved tools/fb_page_filled.png');

  // 4. Click Create Page
  const createPageBtn = p.locator('div[aria-label="Create Page"][role="button"], div[role="button"]:has-text("Create Page")').first();
  console.log('Create Page button enabled:', await createPageBtn.isEnabled());
  await createPageBtn.click();
  console.log('Clicked Create Page, waiting 10s for page creation...');
  await p.waitForTimeout(10000);

  await p.screenshot({ path: 'tools/fb_page_created_step2.png' });
  console.log('Saved tools/fb_page_created_step2.png. URL:', p.url());

  const postText = await p.evaluate(() => document.body.innerText.slice(0, 600));
  console.log('Text after create:', postText);

  // Keep page open for profile picture and cover photo upload
  process.exit(0);
})();
