const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));
  if (igPage) {
    const html = await igPage.evaluate(() => {
      const container = document.body;
      return container ? container.innerHTML : '';
    });
    // Find where "Enter the code" is
    const idx = html.indexOf('Enter the code');
    console.log('Snippet around "Enter the code":');
    console.log(html.slice(Math.max(0, idx - 200), Math.min(html.length, idx + 400)));
  }
  process.exit(0);
})();
