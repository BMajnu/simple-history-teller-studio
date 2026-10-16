const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  await p.goto('https://www.instagram.com/accounts/account_type_and_tools/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  const elements = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, div[role="button"], span'))
      .filter(el => el.innerText && el.innerText.includes('Switch to professional'))
      .map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        href: el.getAttribute('href'),
        class: el.className
      }));
  });
  console.log('Switch elements:', elements);

  // Click the element and see what happens
  const target = p.locator('span:text-is("Switch to professional account")').first();
  await target.click();
  await p.waitForTimeout(3000);

  console.log('URL after click:', p.url());
  await p.screenshot({ path: 'tools/ig_pro_after_click.png' });

  // List all text/buttons currently visible on the page
  const textContent = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="dialog"] button, div[role="dialog"] span, h2, h3'))
      .map(el => el.innerText.trim())
      .filter(Boolean);
  });
  console.log('Dialog / page elements:', textContent);

  await p.close();
  process.exit(0);
})();
