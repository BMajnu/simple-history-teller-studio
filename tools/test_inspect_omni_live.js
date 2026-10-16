const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());

  const selects = await page.locator('mat-select, [role="combobox"]').allInnerTexts();
  console.log('Comboboxes/Selects:', selects);

  const pills = await page.locator('.pill, mat-chip, button').allInnerTexts();
  console.log('Pill/button samples:', pills.filter(p => p.length > 0 && p.length < 30).slice(0, 20));

  const textarea = page.locator('textarea').first();
  console.log('Textarea visible:', await textarea.isVisible());

  await browser.close();
})();
