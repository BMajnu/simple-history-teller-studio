const { chromium } = require('playwright-core');

async function getLatestTikTokCode(ctx) {
  const gPage = await ctx.newPage();
  await gPage.goto('https://mail.google.com/mail/u/1/#inbox', { waitUntil: 'domcontentloaded' });
  await gPage.waitForTimeout(4000);

  const code = await gPage.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[role="row"]'));
    for (const r of rows) {
      const txt = r.innerText;
      if (txt.includes('TikTok') && txt.includes('is your verification code')) {
        const match = txt.match(/(\d{6})\s+is your verification code/);
        if (match) return match[1];
      }
    }
    return null;
  });

  await gPage.close();
  return code;
}

(async () => {
  console.log('=== STARTING TIKTOK CHANNEL 1 SIGNUP ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const selectors = page.locator('div[class*="DivSelector"]');
  // Month
  console.log('Selecting Month...');
  await selectors.nth(0).click();
  await page.waitForTimeout(300);
  await page.locator('#Month-options-item-0').click();
  await page.waitForTimeout(300);

  // Day
  console.log('Selecting Day...');
  await selectors.nth(1).click();
  await page.waitForTimeout(300);
  await page.locator('#Day-options-item-0').click();
  await page.waitForTimeout(300);

  // Year
  console.log('Selecting Year...');
  await selectors.nth(2).click();
  await page.waitForTimeout(300);
  const yearOpt = page.locator('div[id^="Year-options-item"]:has-text("1995")').first();
  await yearOpt.scrollIntoViewIfNeeded();
  await yearOpt.click();
  await page.waitForTimeout(500);

  // Email
  console.log('Typing Email...');
  const emailInput = page.locator('input[placeholder*="Email"]');
  await emailInput.click();
  await page.keyboard.type('bmajnu980@gmail.com', { delay: 40 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(400);

  // Password
  console.log('Typing Password...');
  const pwdInput = page.locator('input[placeholder*="Password"]');
  await pwdInput.click();
  await page.keyboard.type('***REMOVED***', { delay: 40 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(600);

  // Send Code
  console.log('Clicking Send code...');
  const sendBtn = page.locator('button[data-e2e="send-code-button"]').first();
  await sendBtn.click({ force: true });
  console.log('Waiting 8s for email delivery...');
  await page.waitForTimeout(8000);

  // Fetch code
  console.log('Fetching code from Gmail...');
  const code = await getLatestTikTokCode(ctx);
  console.log('Retrieved TikTok code:', code);

  if (code) {
    const codeInput = page.locator('input[placeholder*="6-digit"]');
    await codeInput.click();
    await page.keyboard.type(code, { delay: 50 });
    await page.waitForTimeout(1000);

    console.log('Clicking Next...');
    const nextBtn = page.locator('button:has-text("Next"), button[type="submit"]').first();
    await nextBtn.click();
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'tools/tiktok_after_next.png' });
    console.log('Saved tools/tiktok_after_next.png. URL now:', page.url());
  } else {
    console.error('Could not get TikTok code!');
  }

  // Keep page open or inspect
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/tiktok_step2_screen.png' });
  console.log('Saved tools/tiktok_step2_screen.png');

  // Do not close page immediately if username setup is needed
  process.exit(0);
})();
