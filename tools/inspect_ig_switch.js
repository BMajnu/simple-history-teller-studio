const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  await p.goto('https://www.instagram.com/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);

  // Click Switch link
  const switchLink = p.locator('span:text-is("Switch"), div:text-is("Switch"), button:has-text("Switch")').first();
  if (await switchLink.isVisible().catch(() => false)) {
    console.log('Clicking Switch link...');
    await switchLink.click();
    await p.waitForTimeout(3000);
  }

  const client = await p.context().newCDPSession(p);
  const snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_switch_modal.png', Buffer.from(snap.data, 'base64'));

  const text = await p.innerText('body');
  console.log('Snippet:\n', text.slice(0, 400).replace(/\n+/g, ' '));

  await p.close();
  process.exit(0);
})();
