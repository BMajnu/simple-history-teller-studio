const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('confirmemail.php'));
  if (!p) {
    console.log('No confirmemail page found!');
    process.exit(1);
  }

  console.log('Found confirm page:', p.url());
  const codeInput = p.locator('input[type="text"], input[name*="code"]').first();
  await codeInput.click();
  await codeInput.fill('25621');
  await p.waitForTimeout(500);

  console.log('Clicking Continue...');
  const continueBtn = p.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue"), input[value="Continue"]').first();
  await continueBtn.click();
  await p.waitForTimeout(8000);

  console.log('URL now:', p.url());
  await p.screenshot({ path: 'tools/fb_after_confirmation.png' });
  console.log('Saved tools/fb_after_confirmation.png');

  const text = await p.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Body text now:', text);

  process.exit(0);
})();
