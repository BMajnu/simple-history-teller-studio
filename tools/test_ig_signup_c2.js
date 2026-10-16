const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== SIGNING UP INSTAGRAM FOR BANGLA (C2) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const incognito = await browser.newContext();
  const page = await incognito.newPage();

  console.log('Navigating to Instagram Signup...');
  await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(4000);

  const client = await incognito.newCDPSession(page);
  let snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_c2_signup_form.png', Buffer.from(snap.data, 'base64'));

  // Inspect form inputs
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({
      name: i.name,
      type: i.type,
      placeholder: i.placeholder,
      ariaLabel: i.getAttribute('aria-label')
    }));
  });
  console.log('Inputs found:', inputs);

  // If inputs are present
  const emailInput = page.locator('input[name="emailOrPhone"], input[aria-label="Mobile Number or Email"], input[type="text"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    console.log('Filling email: bmajnu981@gmail.com');
    await emailInput.fill('bmajnu981@gmail.com');
    await page.waitForTimeout(500);

    const nameInput = page.locator('input[name="fullName"], input[aria-label="Full Name"]').first();
    await nameInput.fill('Simple History Teller Bangla');
    await page.waitForTimeout(500);

    const userInput = page.locator('input[name="username"], input[aria-label="Username"]').first();
    await userInput.fill('simplehistorytellerbn');
    await page.waitForTimeout(500);

    const passInput = page.locator('input[name="password"], input[type="password"]').first();
    await passInput.fill('***REMOVED***');
    await page.waitForTimeout(1000);

    snap = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('tools/ig_c2_filled.png', Buffer.from(snap.data, 'base64'));
    console.log('Filled form screenshot saved.');

    // Click Sign up button
    const signupBtn = page.locator('button[type="submit"]:has-text("Sign up"), button:has-text("Sign up")').first();
    console.log('Clicking Sign up button...');
    await signupBtn.click();
    await page.waitForTimeout(8000);

    snap = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('tools/ig_c2_after_submit.png', Buffer.from(snap.data, 'base64'));
    console.log('After submit URL:', page.url());
  } else {
    console.log('Inputs not found, checking text...');
    const bodyText = await page.innerText('body');
    console.log('Body snippet:\n', bodyText.slice(0, 500));
  }

  process.exit(0);
})();
