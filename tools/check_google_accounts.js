const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();
  await page.goto('https://accounts.google.com/AccountChooser?service=mail&continue=https://mail.google.com/mail/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Account chooser text snippet:', text.slice(0, 500));
  
  await page.screenshot({ path: 'tools/google_account_chooser.png' });
  console.log('Saved tools/google_account_chooser.png. URL:', page.url());
  await page.close();
  process.exit(0);
})();
