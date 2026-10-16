const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  page.on('response', resp => {
    if (resp.url().includes('tiktok.com/passport') || resp.url().includes('send_code') || resp.url().includes('verify')) {
      console.log('Response:', resp.status(), resp.url());
    }
  });

  await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const selectors = page.locator('div[class*="DivSelector"]');
  // Month
  await selectors.nth(0).click();
  await page.waitForTimeout(300);
  await page.locator('#Month-options-item-0').click();
  await page.waitForTimeout(300);

  // Day
  await selectors.nth(1).click();
  await page.waitForTimeout(300);
  await page.locator('#Day-options-item-0').click();
  await page.waitForTimeout(300);

  // Year
  await selectors.nth(2).click();
  await page.waitForTimeout(300);
  const yearOpt = page.locator('div[id^="Year-options-item"]:has-text("1995")').first();
  await yearOpt.scrollIntoViewIfNeeded();
  await yearOpt.click();
  await page.waitForTimeout(300);

  // Email & Password
  await page.locator('input[placeholder*="Email"]').fill('bmajnu980@gmail.com');
  await page.waitForTimeout(300);
  await page.locator('input[placeholder*="Password"]').fill('***REMOVED***');
  await page.waitForTimeout(500);

  console.log('Clicking Send code...');
  const sendBtn = page.locator('button[data-e2e="send-code-button"]').first();
  await sendBtn.click();
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'tools/tiktok_code_clicked_detail.png' });
  console.log('Saved tools/tiktok_code_clicked_detail.png');

  // Check if captcha iframe or container popped up
  const iframes = page.frames().map(f => f.url());
  console.log('Frames:', iframes);

  const errorText = await page.evaluate(() => {
    const err = document.querySelector('span[class*="SpanError"], div[class*="Error"], div[role="alert"]');
    return err ? err.innerText : 'none';
  });
  console.log('Error text:', errorText);

  await page.close();
  process.exit(0);
})();
