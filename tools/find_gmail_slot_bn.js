const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== CHECKING GMAIL INBOX FOR BMAJNU981 ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  // Try slots u/0, u/1, u/2, u/3, u/4 to verify which slot is bmajnu981@gmail.com
  let targetUrl = '';
  for (let u = 0; u <= 4; u++) {
    await p.goto(`https://mail.google.com/mail/u/${u}/#inbox`, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(3000);
    const title = await p.title();
    console.log(`Slot u/${u} title:`, title);
    if (title.includes('bmajnu981@gmail.com')) {
      targetUrl = `https://mail.google.com/mail/u/${u}/#inbox`;
      console.log(`FOUND bmajnu981@gmail.com at slot u/${u}!`);
      break;
    }
  }

  if (targetUrl) {
    const client = await p.context().newCDPSession(p);
    const snap = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('tools/gmail_bmajnu981_inbox.png', Buffer.from(snap.data, 'base64'));
    console.log('Saved tools/gmail_bmajnu981_inbox.png');
  }

  await p.close();
  process.exit(0);
})();
