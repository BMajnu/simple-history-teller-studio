const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  p.on('dialog', async d => {
    try { await d.dismiss(); } catch (e) {}
  });

  for (let u = 0; u <= 4; u++) {
    try {
      await p.goto(`https://mail.google.com/mail/u/${u}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await p.waitForTimeout(3000);
      const title = await p.title();
      console.log(`Slot u/${u}: title = ${title}`);
    } catch (e) {
      console.log(`Slot u/${u}: error = ${e.message}`);
    }
  }

  await p.close();
  process.exit(0);
})();
