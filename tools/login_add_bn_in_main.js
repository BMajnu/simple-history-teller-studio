const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== LOGGING BANGLA IG INTO MAIN BROWSER SESSION ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  console.log('Navigating to Instagram...');
  await p.goto('https://www.instagram.com/', { waitUntil: 'networkidle', timeout: 35000 });
  await p.waitForTimeout(3000);

  // Click Switch link on the right sidebar
  const switchBtn = p.locator('span:text-is("Switch"), div:text-is("Switch"), button:has-text("Switch")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log('Clicking Switch link...');
    await switchBtn.click();
    await p.waitForTimeout(2000);
  }

  // Look for username & password inputs
  const userInput = p.locator('input[name="username"], input[aria-label*="username"], input[type="text"]').last();
  const passInput = p.locator('input[name="password"], input[type="password"]').last();

  console.log('Filling username: simplehistorytellerbn');
  await userInput.fill('simplehistorytellerbn');
  await p.waitForTimeout(500);

  console.log('Filling password...');
  await passInput.fill('***REMOVED***');
  await p.waitForTimeout(500);

  // Click Log in
  const loginSubmit = p.locator('button[type="submit"], button:has-text("Log in"), div[role="button"]:has-text("Log in")').first();
  console.log('Clicking Log in...');
  await loginSubmit.click();
  await p.waitForTimeout(8000);

  console.log('URL after login click:', p.url());
  const bodyAfterLogin = await p.innerText('body');
  console.log('Page text snippet:\n', bodyAfterLogin.slice(0, 400).replace(/\n+/g, ' '));

  // If asking for email code
  if (bodyAfterLogin.includes('Check your email') || bodyAfterLogin.includes('Enter the code we sent')) {
    console.log('Instagram requested email code! Fetching from Gmail u/4...');
    const mailPage = await ctx.newPage();
    mailPage.on('dialog', async d => { try { await d.dismiss(); } catch(e){} });
    await mailPage.goto('https://mail.google.com/mail/u/4/#inbox', { waitUntil: 'domcontentloaded' });
    await mailPage.waitForTimeout(6000);

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
    console.log('Found verification code in Gmail:', code);
    await mailPage.close();

    if (code) {
      // Find visible code input
      const visibleInput = await p.evaluate(() => {
        const inps = Array.from(document.querySelectorAll('input')).filter(i => {
          const r = i.getBoundingClientRect();
          return r.width > 50 && r.height > 20;
        });
        if (inps.length > 0) {
          const r = inps[inps.length - 1].getBoundingClientRect();
          return { x: r.x + r.width/2, y: r.y + r.height/2 };
        }
        return null;
      });

      if (visibleInput) {
        await p.mouse.click(visibleInput.x, visibleInput.y);
      } else {
        const cInp = p.locator('input[name="verificationCode"], input[type="text"]').last();
        if (await cInp.isVisible().catch(() => false)) await cInp.click();
      }
      await p.waitForTimeout(500);
      console.log(`Typing code: ${code}`);
      await p.keyboard.type(code, { delay: 100 });
      await p.waitForTimeout(1000);

      // Click Continue
      const contBtn = p.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue")').first();
      if (await contBtn.isVisible().catch(() => false)) {
        console.log('Clicking Continue...');
        await contBtn.click();
      } else {
        await p.keyboard.press('Enter');
      }
      await p.waitForTimeout(12000);
    }
  }

  const client = await ctx.newCDPSession(p);
  const snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_c2_main_session_result.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved tools/ig_c2_main_session_result.png. URL:', p.url());

  const finalText = await p.innerText('body');
  console.log('Final text snippet:\n', finalText.slice(0, 500).replace(/\n+/g, ' '));

  process.exit(0);
})();
