const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('editing/profile')) || await ctx.newPage();

  console.log('Current URL:', page.url());
  if (!page.url().includes('editing/profile')) {
    await page.goto('https://studio.youtube.com/channel/UCkG4y9NJQ5yCys3jxFDUOcg/editing/profile', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  }

  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log('Total file inputs found:', count);

  for (let i = 0; i < count; i++) {
    const parent = await fileInputs.nth(i).evaluate(el => {
      let p = el.parentElement;
      return {
        id: el.id,
        name: el.name,
        parentTag: p ? p.tagName : '',
        parentClass: p ? p.className : '',
        grandParentTag: p && p.parentElement ? p.parentElement.tagName : '',
        grandParentText: p && p.parentElement ? p.parentElement.innerText.slice(0, 100) : ''
      };
    });
    console.log(`Input ${i}:`, parent);
  }

  const sections = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-form-header, ytcp-section, h2, h3, .section-title')).map(el => el.innerText.trim()).filter(Boolean);
  });
  console.log('Sections on page:', sections);

  process.exit(0);
})();
