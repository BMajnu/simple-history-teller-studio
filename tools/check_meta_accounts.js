const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== CHECKING META ACCOUNTS CENTER ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  await p.goto('https://accountscenter.facebook.com/profiles', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);

  const client = await p.context().newCDPSession(p);
  const snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/meta_profiles_list.png', Buffer.from(snap.data, 'base64'));

  const text = await p.innerText('body');
  console.log('Accounts Center text snippet:\n', text.slice(0, 1000));

  await p.close();
  process.exit(0);
})();
