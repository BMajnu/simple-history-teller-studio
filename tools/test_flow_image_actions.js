const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    await page.goto('https://flow.google.com/project/6b6c9890-d01a-498e-840d-d27c7ab94128', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const tiles = page.locator('flow-grid-tile-container');
    await tiles.nth(1).click();
    await page.waitForTimeout(2000);

    const info = await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button, [role="button"], mat-select, mat-chip'));
      return {
        inputs: Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]')).map(i => ({
          tag: i.tagName,
          placeholder: i.getAttribute('placeholder'),
          text: i.innerText
        })),
        buttons: allBtns.map(b => ({
          text: (b.innerText || '').slice(0, 40).trim(),
          label: b.getAttribute('aria-label') || '',
          icon: b.querySelector('mat-icon')?.innerText || ''
        })).filter(x => x.text || x.label || x.icon)
      };
    });

    console.log('Inputs and Buttons on image view:', JSON.stringify(info, null, 2));
    await page.close();
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
