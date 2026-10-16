const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  console.log('Navigating to Facebook Page creation...');
  await p.goto('https://www.facebook.com/pages/create/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);

  console.log('Page Create URL:', p.url());
  await p.screenshot({ path: 'tools/fb_page_create_screen.png' });
  console.log('Saved tools/fb_page_create_screen.png');

  // Inspect input fields (Page name, Category, Bio)
  const inputs = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('input, textarea, div[role="combobox"]')).map(el => ({
      tag: el.tagName,
      type: el.type,
      ariaLabel: el.getAttribute('aria-label'),
      placeholder: el.placeholder,
      value: el.value,
      role: el.getAttribute('role')
    }));
  });
  console.log('Page create inputs:', inputs);

  await p.close();
  process.exit(0);
})();
