const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== LOGGING IN WITH BMAJNU981@GMAIL.COM ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const incognito = await browser.newContext();
  const page = await incognito.newPage();

  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(3000);

  // Fill inputs
  const inps = page.locator('input');
  await inps.nth(0).fill('bmajnu981@gmail.com');
  await page.waitForTimeout(500);
  await inps.nth(1).fill('***REMOVED***');
  await page.waitForTimeout(500);

  // Click Log in
  const loginBtn = page.locator('button[type="submit"], button:has-text("Log in"), div[role="button"]:has-text("Log in")').first();
  await loginBtn.click();
  await page.waitForTimeout(10000);

  const client = await incognito.newCDPSession(page);
  const snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_c2_after_login_real.png', Buffer.from(snap.data, 'base64'));

  console.log('Current URL after login:', page.url());
  const bodyText = await page.innerText('body');
  console.log('Snippet after login:\n', bodyText.slice(0, 500).replace(/\n+/g, ' '));

  process.exit(0);
})();
