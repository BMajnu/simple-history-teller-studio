const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to TikTok email signup...');
  await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('URL:', page.url());
  await page.screenshot({ path: 'tools/tiktok_email_signup_page.png' });
  console.log('Saved tools/tiktok_email_signup_page.png');

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, button')).map(el => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      ariaLabel: el.getAttribute('aria-label'),
      text: el.innerText
    }));
  });
  console.log('TikTok inputs:', JSON.stringify(inputs, null, 2));

  await page.close();
  process.exit(0);
})();
