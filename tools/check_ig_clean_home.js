const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const incognito = await browser.newContext();
  const page = await incognito.newPage();
  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(5000);

  const client = await incognito.newCDPSession(page);
  const snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/ig_clean_home.png', Buffer.from(snap.data, 'base64'));

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({
      name: i.name,
      type: i.type,
      ariaLabel: i.getAttribute('aria-label'),
      placeholder: i.placeholder
    }));
  });
  console.log('Inputs found on clean home:', inputs);

  process.exit(0);
})();
