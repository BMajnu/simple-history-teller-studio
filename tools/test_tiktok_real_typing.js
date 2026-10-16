const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

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
  await page.waitForTimeout(500);

  // Email input focus and type
  const emailInput = page.locator('input[placeholder*="Email"]');
  await emailInput.click();
  await page.keyboard.type('bmajnu980@gmail.com', { delay: 50 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  // Password input focus and type
  const pwdInput = page.locator('input[placeholder*="Password"]');
  await pwdInput.click();
  await page.keyboard.type('***REMOVED***', { delay: 50 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(1000);

  // Check send code button properties
  const btnInfo = await page.evaluate(() => {
    const btn = document.querySelector('button[data-e2e="send-code-button"]');
    if (!btn) return 'Button not found';
    return {
      tagName: btn.tagName,
      disabled: btn.disabled,
      className: btn.className,
      innerText: btn.innerText,
      ariaDisabled: btn.getAttribute('aria-disabled'),
      attributes: Array.from(btn.attributes).map(a => `${a.name}="${a.value}"`)
    };
  });
  console.log('Button info before click:', btnInfo);

  // Click it
  console.log('Clicking send code button via mouse click...');
  await page.locator('button[data-e2e="send-code-button"]').click({ force: true });
  await page.waitForTimeout(5000);

  const btnInfoAfter = await page.evaluate(() => {
    const btn = document.querySelector('button[data-e2e="send-code-button"]');
    return btn ? { disabled: btn.disabled, innerText: btn.innerText } : null;
  });
  console.log('Button info after click:', btnInfoAfter);

  await page.screenshot({ path: 'tools/tiktok_typed_send_code.png' });
  await page.close();
  process.exit(0);
})();
