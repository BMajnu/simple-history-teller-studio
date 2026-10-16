const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const elements = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, a, [role="button"], .project-tile, flow-project-card, mat-card, [tabindex="0"]'));
      return all.map(el => ({
        tag: el.tagName,
        text: (el.innerText || '').slice(0, 50).trim(),
        ariaLabel: el.getAttribute('aria-label') || '',
        class: el.className
      })).filter(x => x.text || x.ariaLabel);
    });

    console.log('Clickable elements count:', elements.length);
    console.log('Sample elements:', JSON.stringify(elements.slice(0, 25), null, 2));

    await page.close();
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
