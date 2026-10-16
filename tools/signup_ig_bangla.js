const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== SIGNING UP BANGLA ON INSTAGRAM ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  
  // Use a fresh context for registration
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
  // Inspect birthday selects/dropdowns
  const bdayElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div, button, span'))
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

  const client = await incognito.newCDPSession(page);
  let snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_c2_filled_verified.png', Buffer.from(snap.data, 'base64'));

  // 6. Submit
  console.log('Submitting form...');
  const submitBtn = page.locator('button[type="submit"], button:has-text("Submit"), div[role="button"]:has-text("Submit")').first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
  } else {
    // Click submit by coordinate or finding button
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

  console.log('Waiting 10s after submit...');
  await page.waitForTimeout(10000);

  snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_c2_after_submit_screen.png', Buffer.from(snap.data, 'base64'));
  console.log('Current URL after submit:', page.url());

  const bodyText = await page.innerText('body');
  console.log('Snippet after submit:\n', bodyText.slice(0, 500).replace(/\n+/g, ' '));

  // If asking for confirmation code, let us fetch it from Gmail!
  if (bodyText.includes('confirmation code') || bodyText.includes('Enter confirmation code') || bodyText.includes('code')) {
    console.log('Instagram is asking for confirmation code! Checking Gmail u/4...');
    const ctxMain = browser.contexts()[0];
    const mailPage = await ctxMain.newPage();
    mailPage.on('dialog', async d => { try { await d.dismiss(); } catch(e){} });
    await mailPage.goto('https://mail.google.com/mail/u/4/#inbox', { waitUntil: 'domcontentloaded' });
    await mailPage.waitForTimeout(6000);

    const emailList = await mailPage.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[role="row"], .zA'));
      return rows.slice(0, 5).map(r => r.innerText.replace(/\n+/g, ' '));
    });
    console.log('Recent emails in u/4:', emailList);
    await mailPage.close();
  }

  process.exit(0);
})();
