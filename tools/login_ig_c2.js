const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== LOGGING INTO BANGLA INSTAGRAM ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const incognito = await browser.newContext();
  const page = await incognito.newPage();

  await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(3000);

  // Username
  const userInput = page.locator('input[name="username"], input[aria-label="Phone number, username, or email"]').first();
  await userInput.fill('simplehistorytellerbn');
  await page.waitForTimeout(500);

  // Password
  const passInput = page.locator('input[name="password"]').first();
  await passInput.fill('***REMOVED***');
  await page.waitForTimeout(500);

  // Click Log in
  const loginBtn = page.locator('button[type="submit"], button:has-text("Log in")').first();
  await loginBtn.click();
  await page.waitForTimeout(10000);

  const client = await incognito.newCDPSession(page);
  let snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_c2_after_login.png', Buffer.from(snap.data, 'base64'));

  console.log('Current URL after login:', page.url());
  const bodyText = await page.innerText('body');
  console.log('Snippet after login:\n', bodyText.slice(0, 500).replace(/\n+/g, ' '));

  process.exit(0);
})();
