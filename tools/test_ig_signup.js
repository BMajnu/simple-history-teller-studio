const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Instagram Signup...');
  await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(4000);

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'tools/ig_signup_test.png' });
  console.log('Saved tools/ig_signup_test.png');

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({ name: i.name, type: i.type, placeholder: i.placeholder, ariaLabel: i.getAttribute('aria-label') }));
  });
  console.log('Inputs found:', inputs);

  await page.close();
  process.exit(0);
})();
