const { chromium } = require('playwright-core');

(async () => {
  console.log('=== TESTING TIKTOK SIGNUP & SEND CODE ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const selectors = page.locator('div[class*="DivSelector"]');

  // 1. Month (January)
  console.log('Selecting Month...');
  await selectors.nth(0).click();
  await page.waitForTimeout(400);
  await page.locator('div[class*="DivItem"]:has-text("January")').first().click();
  await page.waitForTimeout(400);

  // 2. Day (10)
  console.log('Selecting Day...');
  await selectors.nth(1).click();
  await page.waitForTimeout(400);
  await page.locator('div[class*="DivItem"]:text-is("10")').first().click();
  await page.waitForTimeout(400);

  // 3. Year (1995)
  console.log('Selecting Year...');
  await selectors.nth(2).click();
  await page.waitForTimeout(400);
  await page.locator('div[class*="DivItem"]:has-text("1995")').first().click();
  await page.waitForTimeout(400);

  // 4. Fill Email
  console.log('Filling Email: bmajnu980@gmail.com...');
  const emailInput = page.locator('input[placeholder*="Email"]').first();
  await emailInput.fill('bmajnu980@gmail.com');
  await page.waitForTimeout(400);

  // 5. Fill Password
  console.log('Filling Password: ***REMOVED***...');
  const passInput = page.locator('input[placeholder*="Password"]').first();
  await passInput.fill('***REMOVED***');
  await page.waitForTimeout(600);

  await page.screenshot({ path: 'tools/tiktok_complete_form.png' });
  console.log('Saved tools/tiktok_complete_form.png');

  // Check Send code button
  const sendBtn = page.locator('button[data-e2e="send-code-button"], button:has-text("Send code")').first();
  const isEnabled = await sendBtn.isEnabled();
  console.log('Send code button enabled:', isEnabled);

  if (isEnabled) {
    console.log('Clicking Send code...');
    await sendBtn.click();
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'tools/tiktok_code_sent.png' });
    console.log('Saved tools/tiktok_code_sent.png');
  }

  await page.close();
  process.exit(0);
})();
