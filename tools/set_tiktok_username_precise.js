const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();

  let targetPage = null;
  for (const p of pages) {
    const url = p.url();
    if (url.includes('signup/create-username')) {
      targetPage = p;
    } else if (url.includes('tiktok.com/signup/phone-or-email')) {
      console.log('Closing redundant TikTok page:', url);
      await p.close();
    }
  }

  if (!targetPage) {
    console.error('Target page create-username not found!');
    process.exit(1);
  }

  console.log('Using target TikTok page:', targetPage.url());
  const input = targetPage.locator('input').first();
  await input.click();
  // Clear any placeholder/default text
  await targetPage.keyboard.press('Control+A');
  await targetPage.keyboard.press('Backspace');
  await targetPage.keyboard.type('simplehistoryteller', { delay: 40 });
  await targetPage.waitForTimeout(1000);

  // Check what username was typed or suggested
  await targetPage.screenshot({ path: 'tools/tiktok_username_typed.png' });
  console.log('Saved tools/tiktok_username_typed.png');

  // Look for Sign up button
  const submitBtn = targetPage.locator('button:has-text("Sign up"), button[type="submit"]').first();
  const isEnabled = await submitBtn.isEnabled();
  console.log('Sign up button enabled:', isEnabled);

  if (isEnabled) {
    await submitBtn.click();
    await targetPage.waitForTimeout(5000);
    console.log('URL after submit:', targetPage.url());
    await targetPage.screenshot({ path: 'tools/tiktok_final_dashboard.png' });
  }

  process.exit(0);
})();
