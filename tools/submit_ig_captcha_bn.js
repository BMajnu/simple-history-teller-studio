const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== SUBMITTING CAPTCHA ON TAB 11 ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('instagram.com/accounts/suspended'));
  if (!p) {
    console.error('Suspended page not found');
    process.exit(1);
  }

  // Clear and type 116060
  const input = p.locator('input[type="text"], input').first();
  await input.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.press('Backspace');
  await p.keyboard.type('116060', { delay: 100 });
  await p.waitForTimeout(1000);

  // Click Next
  const nextBtn = p.locator('button:has-text("Next"), div[role="button"]:has-text("Next")').first();
  await nextBtn.click();
  await p.waitForTimeout(8000);

  const client = await ctx.newCDPSession(p);
  const snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_captcha_c2_result.png', Buffer.from(snap.data, 'base64'));

  console.log('URL after captcha:', p.url());
  const bodyText = await p.innerText('body');
  console.log('Body snippet:\n', bodyText.slice(0, 500).replace(/\n+/g, ' '));

  process.exit(0);
})();
