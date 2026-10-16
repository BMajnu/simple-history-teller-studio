const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.goto('https://mail.google.com/mail/u/1/#inbox', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const emails = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tr[role="row"]')).slice(0, 10).map(r => r.innerText.replace(/\n+/g, ' | '));
  });
  console.log('Top emails in u/1:');
  emails.forEach((e, i) => console.log(`[${i}] ${e}`));
  await page.screenshot({ path: 'tools/gmail_u1_inbox.png' });
  await page.close();
  process.exit(0);
})();
