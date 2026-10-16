const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  p.on('dialog', async d => { try { await d.dismiss(); } catch(e){} });
  await p.goto('https://mail.google.com/mail/u/4/#inbox', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  const emails = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('tr[role="row"], .zA')).slice(0, 6).map(r => r.innerText.replace(/\n/g, ' '));
  });
  console.log('Emails in u/4:\n' + emails.join('\n'));
  await p.close();
  process.exit(0);
})();
