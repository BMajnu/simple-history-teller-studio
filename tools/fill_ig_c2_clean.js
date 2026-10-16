const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== FILLING INSTAGRAM SIGNUP FOR BANGLA ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const incognito = await browser.newContext();
  const page = await incognito.newPage();

  await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(4000);

  const client = await incognito.newCDPSession(page);

  // 1. Email
  const inputs = page.locator('input');
  console.log('Filling email: bmajnu981@gmail.com');
  await inputs.nth(0).fill('bmajnu981@gmail.com');
  await page.waitForTimeout(500);

  // 2. Password
  console.log('Filling password...');
  await inputs.nth(1).fill('***REMOVED***');
  await page.waitForTimeout(500);

  // 3. Birthday
  console.log('Selecting Month...');
  const dropdowns = page.locator('div[aria-haspopup="listbox"], [role="combobox"], [aria-label*="Month"], [aria-label*="Day"], [aria-label*="Year"]');
  const dCount = await dropdowns.count();
  console.log('Dropdowns count:', dCount);

  // Let us inspect birthday elements
  const bdayElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div, button, span, select'))
      .filter(el => ['Month', 'Day', 'Year'].includes(el.innerText && el.innerText.trim()))
      .map(el => {
        const r = el.getBoundingClientRect();
        return { text: el.innerText.trim(), x: r.x + r.width/2, y: r.y + r.height/2 };
      });
  });
  console.log('Birthday elements:', bdayElements);

  if (bdayElements.find(e => e.text === 'Month')) {
    const m = bdayElements.find(e => e.text === 'Month');
    await page.mouse.click(m.x, m.y);
    await page.waitForTimeout(500);
    const opt = page.locator('div[role="option"]:has-text("January"), li:has-text("January"), span:has-text("January")').first();
    if (await opt.isVisible().catch(() => false)) await opt.click();
    await page.waitForTimeout(500);
  }

  if (bdayElements.find(e => e.text === 'Day')) {
    const d = bdayElements.find(e => e.text === 'Day');
    await page.mouse.click(d.x, d.y);
    await page.waitForTimeout(500);
    const opt = page.locator('div[role="option"]:has-text("15"), li:has-text("15"), span:has-text("15")').first();
    if (await opt.isVisible().catch(() => false)) await opt.click();
    await page.waitForTimeout(500);
  }

  if (bdayElements.find(e => e.text === 'Year')) {
    const y = bdayElements.find(e => e.text === 'Year');
    await page.mouse.click(y.x, y.y);
    await page.waitForTimeout(500);
    const opt = page.locator('div[role="option"]:has-text("1995"), li:has-text("1995"), span:has-text("1995")').first();
    if (await opt.isVisible().catch(() => false)) await opt.click();
    await page.waitForTimeout(500);
  }

  // 4. Full Name
  console.log('Filling Full Name...');
  await inputs.nth(2).fill('Simple History Teller Bangla');
  await page.waitForTimeout(500);

  // 5. Username
  console.log('Filling Username...');
  await inputs.nth(3).fill('simplehistorytellerbn');
  await page.waitForTimeout(1000);

  let snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_c2_filled_verified.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved tools/ig_c2_filled_verified.png');

  // Find Submit button
  const submitBtn = page.locator('button[type="submit"], div[role="button"]:has-text("Submit"), button:has-text("Submit")').first();
  if (await submitBtn.isVisible().catch(() => false)) {
    console.log('Clicking Submit button...');
    await submitBtn.click();
  } else {
    console.log('Looking for submit via evaluate...');
    const btnCoords = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button, div[role="button"]')).find(el => el.innerText && (el.innerText.includes('Submit') || el.innerText.includes('Sign up')));
      if (b) {
        const r = b.getBoundingClientRect();
        return { x: r.x + r.width/2, y: r.y + r.height/2 };
      }
      return null;
    });
    if (btnCoords) {
      await page.mouse.click(btnCoords.x, btnCoords.y);
    }
  }

  console.log('Waiting 10s for response...');
  await page.waitForTimeout(10000);

  snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_c2_after_submit_result.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved tools/ig_c2_after_submit_result.png. URL:', page.url());

  // Keep context open or exit? If code is sent, we need the page to stay open!
  // We can write page session info or keep running until OTP is handled.
  // Let us save PID or wait for OTP check.
  process.exit(0);
})();
