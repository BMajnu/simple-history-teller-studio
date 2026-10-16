const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  await p.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);

  const client = await p.context().newCDPSession(p);
  const snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_main_current.png', Buffer.from(snap.data, 'base64'));

  console.log('Current IG URL:', p.url());
  const bodyText = await p.innerText('body');
  console.log('Snippet:\n', bodyText.slice(0, 300).replace(/\n+/g, ' '));

  await p.close();
  process.exit(0);
})();
