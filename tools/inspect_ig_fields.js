const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Instagram Signup...');
  await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(4000);

  // Inspect form fields
  const fields = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, button')).map(el => ({
      tag: el.tagName,
      name: el.getAttribute('name'),
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      ariaLabel: el.getAttribute('aria-label'),
      text: el.innerText.trim()
    }));
  });
  console.log('Instagram form fields:', JSON.stringify(fields, null, 2));

  await page.close();
  process.exit(0);
})();
