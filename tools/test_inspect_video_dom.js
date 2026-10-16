const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://aistudio.google.com/app/prompts/new_chat', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Open model picker
  const modelBtn = page.locator('button.model-select-button, button:has-text("Gemini"), [aria-label*="model"]').first();
  await modelBtn.click();
  await page.waitForTimeout(1000);

  // Click Video pill
  const videoPill = page.locator('button:has-text("Video")').first();
  await videoPill.click();
  await page.waitForTimeout(1000);

  // Inspect all visible cards/items
  const items = await page.evaluate(() => {
    // Find all elements that look like model rows or cards
    const all = Array.from(document.querySelectorAll('*'));
    const modelRows = all.filter(el => {
      const text = el.innerText || '';
      return (text.includes('gemini-omni') || text.includes('veo-3.1')) && el.children.length > 0;
    }).map(el => ({
      tagName: el.tagName,
      className: el.className,
      innerText: (el.innerText || '').slice(0, 100).replace(/\n/g, ' ')
    }));
    return modelRows;
  });

  console.log('Found model rows:', items.length);
  items.slice(0, 10).forEach((it, idx) => console.log(idx, it.tagName, it.className, '-->', it.innerText));

  await page.close();
})();
