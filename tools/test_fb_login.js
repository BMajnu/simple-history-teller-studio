const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com'));
  if (!p) {
    console.log('No FB tab');
    process.exit(1);
  }

  console.log('Testing FB login for bmajnu980@gmail.com...');
  await p.locator('input[name="email"], input[id="email"]').fill('bmajnu980@gmail.com');
  await p.waitForTimeout(500);
  await p.locator('input[name="pass"], input[id="pass"]').fill('***REMOVED***');
  await p.waitForTimeout(500);

  const loginBtn = p.locator('button[name="login"], button[id="loginbutton"]').first();
  await loginBtn.click();
  await p.waitForTimeout(6000);

  console.log('URL after login:', p.url());
  await p.screenshot({ path: 'tools/fb_after_login.png' });
  console.log('Saved tools/fb_after_login.png');

  const text = await p.evaluate(() => document.body.innerText.slice(0, 400));
  console.log('FB text after login:', text);

  process.exit(0);
})();
