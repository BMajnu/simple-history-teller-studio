const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Gmail for bmajnu980 (u/1)...');
  await page.goto('https://mail.google.com/mail/u/1/#inbox', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('Title:', await page.title());
  await page.screenshot({ path: 'tools/gmail_bmajnu980_inbox.png' });
  console.log('Saved tools/gmail_bmajnu980_inbox.png');

  // Look for latest email text or subject
  const emails = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[role="row"], .zA'));
    return rows.slice(0, 5).map(r => r.innerText.replace(/\n/g, ' '));
  });
  console.log('Latest emails in bmajnu980 inbox:', emails);

  await page.close();
  process.exit(0);
})();
