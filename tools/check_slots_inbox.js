const { chromium } = require('playwright-core');

async function getLatestOtpFromSlot(slot, senderKeyword = '') {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  let p = ctx.pages().find(page => page.url().includes(`/mail/u/${slot}/`));
  if (!p) {
    p = await ctx.newPage();
    await p.goto(`https://mail.google.com/mail/u/${slot}/#inbox`, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(4000);
  } else {
    // Refresh
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(3000);
  }

  const emails = await p.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[role="row"]'));
    return rows.map(r => ({
      sender: r.querySelector('span[email], span[name]')?.innerText || '',
      subject: r.querySelector('span.bqe, span.bog')?.innerText || '',
      snippet: r.querySelector('span.y2')?.innerText || ''
    }));
  });

  console.log(`Slot u/${slot} latest emails:`, emails.slice(0, 5));
  return emails;
}

(async () => {
  console.log('--- Checking slot 4 (bmajnu981@gmail.com) ---');
  await getLatestOtpFromSlot(4);
  console.log('--- Checking slot 2 (bmajnu9811@gmail.com) ---');
  await getLatestOtpFromSlot(2);
  process.exit(0);
})();
