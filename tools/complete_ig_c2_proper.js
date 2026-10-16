const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== SIGNING UP AND VERIFYING BANGLA ON INSTAGRAM ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const incognito = await browser.newContext();
  const page = await incognito.newPage();

  console.log('Navigating to Instagram Signup...');
  await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(3000);

  // 1. Email
  const inputs = page.locator('input');
  console.log('Filling Email: bmajnu981@gmail.com');
  await inputs.nth(0).fill('bmajnu981@gmail.com');
  await page.waitForTimeout(500);

  // 2. Password
  console.log('Filling Password: ***REMOVED***');
  await inputs.nth(1).fill('***REMOVED***');
  await page.waitForTimeout(500);

  // 3. Birthday
  console.log('Setting Birthday...');
  const bdayElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div, button, span'))
      .filter(el => ['Month', 'Day', 'Year'].includes(el.innerText && el.innerText.trim()))
      .map(el => {
        const r = el.getBoundingClientRect();
        return { text: el.innerText.trim(), x: r.x + r.width/2, y: r.y + r.height/2 };
      });
  });

  if (bdayElements.find(e => e.text === 'Month')) {
    const m = bdayElements.find(e => e.text === 'Month');
    await page.mouse.click(m.x, m.y);
    await page.waitForTimeout(600);
    const opt = page.locator('div[role="option"]:has-text("January"), li:has-text("January"), span:has-text("January")').first();
    if (await opt.isVisible().catch(() => false)) await opt.click();
    await page.waitForTimeout(600);
  }

  if (bdayElements.find(e => e.text === 'Day')) {
    const d = bdayElements.find(e => e.text === 'Day');
    await page.mouse.click(d.x, d.y);
    await page.waitForTimeout(600);
    const opt = page.locator('div[role="option"]:has-text("15"), li:has-text("15"), span:has-text("15")').first();
    if (await opt.isVisible().catch(() => false)) await opt.click();
    await page.waitForTimeout(600);
  }

  if (bdayElements.find(e => e.text === 'Year')) {
    const y = bdayElements.find(e => e.text === 'Year');
    await page.mouse.click(y.x, y.y);
    await page.waitForTimeout(600);
    const opt = page.locator('div[role="option"]:has-text("1995"), li:has-text("1995"), span:has-text("1995")').first();
    if (await opt.isVisible().catch(() => false)) await opt.click();
    await page.waitForTimeout(600);
  }

  // 4. Full Name (input 2)
  console.log('Filling Full Name: Simple History Teller Bangla');
  await inputs.nth(2).fill('Simple History Teller Bangla');
  await page.waitForTimeout(500);

  // 5. Username (input 3)
  console.log('Filling Username: simplehistorytellerbn');
  await inputs.nth(3).fill('simplehistorytellerbn');
  await page.waitForTimeout(1000);

  // 6. Submit
  console.log('Submitting form...');
  const submitBtn = page.locator('button[type="submit"], button:has-text("Submit"), div[role="button"]:has-text("Submit")').first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
  } else {
    const btnCoords = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button, div[role="button"]')).find(el => el.innerText && (el.innerText.includes('Submit') || el.innerText.includes('Sign up')));
      if (b) {
        const r = b.getBoundingClientRect();
        return { x: r.x + r.width/2, y: r.y + r.height/2 };
      }
      return null;
    });
    if (btnCoords) await page.mouse.click(btnCoords.x, btnCoords.y);
  }

  console.log('Waiting 10s for confirmation code page...');
  await page.waitForTimeout(10000);

  // 7. Check Gmail u/4 for the fresh OTP
  console.log('Fetching new Instagram verification code from Gmail u/4...');
  const ctxMain = browser.contexts()[0];
  const mailPage = await ctxMain.newPage();
  mailPage.on('dialog', async d => { try { await d.dismiss(); } catch(e){} });
  await mailPage.goto('https://mail.google.com/mail/u/4/#inbox', { waitUntil: 'domcontentloaded' });
  await mailPage.waitForTimeout(5000);

  const code = await mailPage.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[role="row"], .zA'));
    for (const r of rows) {
      const text = r.innerText.replace(/\n/g, ' ');
      if (text.includes('Instagram') && text.includes('code')) {
        const match = text.match(/\b(\d{6})\b/);
        if (match) return match[1];
      }
    }
    return null;
  });
  console.log('Fetched Instagram verification code:', code);
  await mailPage.close();

  if (!code) {
    console.error('No code found in Gmail!');
    process.exit(1);
  }

  // 8. Type code into the single input on page
  console.log(`Focusing input and typing code ${code}...`);
  const inputInfo = await page.evaluate(() => {
    const inps = Array.from(document.querySelectorAll('input'));
    return inps.map(i => ({ type: i.type, placeholder: i.placeholder, rect: i.getBoundingClientRect() }));
  });
  console.log('Confirmation inputs available:', inputInfo);

  if (inputInfo.length > 0) {
    const target = inputInfo[0];
    await page.mouse.click(target.rect.x + target.rect.width / 2, target.rect.y + target.rect.height / 2);
    await page.waitForTimeout(500);
    await page.keyboard.type(code, { delay: 120 });
    await page.waitForTimeout(1000);
  }

  const client = await incognito.newCDPSession(page);
  let snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_c2_code_typed_real.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved tools/ig_c2_code_typed_real.png');

  // 9. Click Continue
  console.log('Clicking Continue button...');
  const continueBtn = page.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue")').first();
  if (await continueBtn.isVisible().catch(() => false)) {
    await continueBtn.click();
  } else {
    await page.keyboard.press('Enter');
  }

  console.log('Waiting 15s for login / redirect...');
  await page.waitForTimeout(15000);

  snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_c2_live_verified.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved tools/ig_c2_live_verified.png. Current URL:', page.url());

  const bodySnippet = await page.innerText('body');
  console.log('Body snippet:\n', bodySnippet.slice(0, 500).replace(/\n+/g, ' '));

  process.exit(0);
})();
