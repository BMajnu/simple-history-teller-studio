const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.log('No create page found');
    process.exit(1);
  }

  p.on('response', async resp => {
    if (resp.url().includes('graphql')) {
      try {
        const text = await resp.text();
        if (text.includes('error') || text.includes('Page') || text.includes('creation') || text.includes('page_create')) {
          console.log('GRAPHQL RESPONSE BODY:', text.slice(0, 400));
        }
      } catch (e) {}
    }
  });

  const btn = p.locator('div[aria-label="Create Page"]').first();
  await btn.click({ force: true });
  await p.waitForTimeout(5000);

  // Check any toast or banner in DOM
  const alerts = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('[role="alert"], div[data-testid*="toast"], span[dir="auto"]')).map(el => el.innerText).filter(t => t && t.length > 5);
  });
  console.log('Alerts/Text in DOM:', alerts.slice(0, 10));

  process.exit(0);
})();
