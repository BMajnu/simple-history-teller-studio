const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com'));

  console.log('Filling email...');
  const emailInp = p.locator('input[type="text"], input[name="email"], input[id="email"]').first();
  await emailInp.click();
  await emailInp.fill('bmajnu980@gmail.com');
  await p.waitForTimeout(500);

  console.log('Filling password...');
  const passInp = p.locator('input[type="password"]').first();
  await passInp.click();
  await passInp.fill('***REMOVED***');
  await p.waitForTimeout(500);

  console.log('Pressing Enter to submit...');
  await passInp.press('Enter');
  await p.waitForTimeout(6000);

  console.log('URL after submit:', p.url());
  await p.screenshot({ path: 'tools/fb_submitted_status.png' });
  console.log('Saved tools/fb_submitted_status.png');

  const text = await p.evaluate(() => document.body.innerText.slice(0, 400));
  console.log('Body text:', text);

  process.exit(0);
})();
