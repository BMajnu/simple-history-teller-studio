const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  const domains = [
    { name: 'Facebook', url: 'https://www.facebook.com/' },
    { name: 'Instagram', url: 'https://www.instagram.com/' },
    { name: 'X / Twitter', url: 'https://x.com/' },
    { name: 'TikTok', url: 'https://www.tiktok.com/' }
  ];

  for (const d of domains) {
    try {
      console.log(`Checking ${d.name}...`);
      await page.goto(d.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(2000);
      const url = page.url();
      const title = await page.title();
      console.log(`${d.name}: URL=${url}, Title=${title}`);
    } catch (e) {
      console.log(`${d.name}: Error - ${e.message}`);
    }
  }

  await page.close();
  process.exit(0);
})();
