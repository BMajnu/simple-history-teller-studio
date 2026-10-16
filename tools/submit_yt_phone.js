const { chromium } = require('playwright-core');

const PHONE = '01833933521';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('youtube.com/verify')) || ctx.pages()[0];

  console.log('Target URL:', page.url());

  // Locate phone input
  const phoneInput = page.locator('input[type="tel"], input[type="text"], input[name*="phone"], input').last();
  await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
  await phoneInput.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);

  console.log('Typing phone number:', PHONE);
  await phoneInput.fill(PHONE);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/yt_verify_phone_typed.png' });
  console.log('Saved tools/yt_verify_phone_typed.png');

  // Click NEXT button
  const nextBtn = page.locator('button:has-text("NEXT"), button:has-text("Next"), div[role="button"]:has-text("NEXT"), #submit-btn, ytcp-button:has-text("NEXT")').first();
  console.log('Next button visible:', await nextBtn.isVisible());
  if (await nextBtn.isVisible()) {
    console.log('Clicking NEXT...');
    await nextBtn.click({ force: true });
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: 'tools/yt_verify_step2_code_screen.png' });
  console.log('Saved tools/yt_verify_step2_code_screen.png');

  process.exit(0);
})().catch(console.error);
