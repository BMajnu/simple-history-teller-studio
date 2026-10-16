const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  let page = pages.find(p => p.url().includes('aistudio.google.com/apps'));
  if (!page) {
    page = await browser.contexts()[0].newPage();
    await page.goto('https://aistudio.google.com/apps', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  }

  const items = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, [role="button"], mat-card, div')).filter(x => x.innerText && x.innerText.includes('Convert text to speech')).map(x => ({
      tag: x.tagName,
      href: x.getAttribute('href') || (x.closest('a') ? x.closest('a').getAttribute('href') : null),
      text: x.innerText.trim().replace(/\s+/g, ' ')
    }));
  });

  console.log('Found:', items);
  process.exit(0);
})();
