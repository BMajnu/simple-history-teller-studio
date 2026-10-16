const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('instagram.com'));
  if (p) {
    const client = await ctx.newCDPSession(p);
    const snap = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('tools/ig_tab11_current.png', Buffer.from(snap.data, 'base64'));
    console.log('Saved tools/ig_tab11_current.png, URL:', p.url());
    const text = await p.innerText('body');
    console.log('Tab 11 text:\n', text.slice(0, 500).replace(/\n+/g, ' '));
  } else {
    console.log('No IG tab found');
  }
  process.exit(0);
})();
