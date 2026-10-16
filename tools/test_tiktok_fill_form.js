const { chromium } = require('playwright-core');

(async () => {
  console.log('=== TESTING TIKTOK SIGNUP FORM FOR CHANNEL 1 ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const selectors = page.locator('div[class*="DivSelector"]');
  console.log('Selectors count:', await selectors.count());

  // 1. Select Month (January)
  console.log('Clicking Month...');
  await selectors.nth(0).click();
  await page.waitForTimeout(500);
  await page.locator('div[role="option"]:has-text("January"), div[class*="DivItem"]:has-text("January"), div:has-text("January")').last().click().catch(() => {});
  await page.waitForTimeout(500);

  // 2. Select Day (15)
  console.log('Clicking Day...');
  await selectors.nth(1).click();
  await page.waitForTimeout(500);
  await page.locator('div[role="option"]:has-text("15"), div[class*="DivItem"]:has-text("15"), div:has-text("15")').last().click().catch(() => {});
  await page.waitForTimeout(500);

  // 3. Select Year (1995)
  console.log('Clicking Year...');
  await selectors.nth(2).click();
  await page.waitForTimeout(500);
  await page.locator('div[role="option"]:has-text("1995"), div[class*="DivItem"]:has-text("1995"), div:has-text("1995")').last().click().catch(() => {});
  await page.waitForTimeout(500);

  // 4. Fill Email
  console.log('Filling Email: bmajnu980@gmail.com...');
  const emailInput = page.locator('input[placeholder*="Email"]').first();
  await emailInput.fill('bmajnu980@gmail.com');
  await page.waitForTimeout(500);

  // 5. Fill Password
  console.log('Filling Password: ***REMOVED***...');
  const passInput = page.locator('input[placeholder*="Password"]').first();
  await passInput.fill('***REMOVED***');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'tools/tiktok_form_ready.png' });
  console.log('Saved tools/tiktok_form_ready.png');

  // 6. Click Send code
  console.log('Clicking Send code button...');
  const sendBtn = page.locator('button:has-text("Send code")').first();
  await sendBtn.click();
  await page.waitForTimeout(6000);

  await page.screenshot({ path: 'tools/tiktok_after_send_code.png' });
  console.log('Saved tools/tiktok_after_send_code.png');

  await page.close();
  process.exit(0);
})();
