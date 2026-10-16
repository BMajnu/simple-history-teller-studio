const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('convert_to_professional_account'));
  if (!p) {
    console.log('No convert page');
    process.exit(1);
  }

  console.log('Clicking Done button...');
  const doneBtn = p.locator('button:has-text("Done")').first();
  await doneBtn.click();
  await p.waitForTimeout(6000);

  console.log('URL now:', p.url());
  const newText = await p.evaluate(() => document.body.innerText.slice(0, 400));
  console.log('New text:', newText);

  process.exit(0);
})();
