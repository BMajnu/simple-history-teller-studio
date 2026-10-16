const { chromium } = require('playwright-core');

(async () => {
  console.log('=== PRECISE TIKTOK SIGNUP TEST ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const selectors = page.locator('div[class*="DivSelector"]');

  // Month
  console.log('Selecting Month...');
  await selectors.nth(0).click();
  await page.waitForTimeout(400);
  await page.locator('#Month-options-item-0').click();
  await page.waitForTimeout(400);

  // Day
  console.log('Selecting Day...');
  await selectors.nth(1).click();
  await page.waitForTimeout(400);
  await page.locator('#Day-options-item-0').click();
  await page.waitForTimeout(400);

  // Year
  console.log('Selecting Year...');
  await selectors.nth(2).click();
  await page.waitForTimeout(400);
  // find year option for 1995 or 1990
  const yearOpt = page.locator('div[id^="Year-options-item"]:has-text("1995"), div[role="option"]:has-text("1995")').first();
  await yearOpt.scrollIntoViewIfNeeded();
  await yearOpt.click();
  await page.waitForTimeout(400);

  // Email
  console.log('Filling Email: bmajnu980@gmail.com...');
  await page.locator('input[placeholder*="Email"]').fill('bmajnu980@gmail.com');
  await page.waitForTimeout(300);

  // Password
  console.log('Filling Password: ***REMOVED***...');
  await page.locator('input[placeholder*="Password"]').fill('***REMOVED***');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'tools/tiktok_form_ready_precise.png' });
  console.log('Saved tools/tiktok_form_ready_precise.png');

  // Click Send code
  const sendBtn = page.locator('button[data-e2e="send-code-button"]').first();
  const isEnabled = await sendBtn.isEnabled();
  console.log('Send code enabled:', isEnabled);

  if (isEnabled) {
    console.log('Clicking Send code button...');
    await sendBtn.click();
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'tools/tiktok_after_send_code_precise.png' });
    console.log('Saved tools/tiktok_after_send_code_precise.png');
  }

  await page.close();
  process.exit(0);
})();
