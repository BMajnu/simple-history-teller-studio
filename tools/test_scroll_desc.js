const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  await page.goto('https://studio.youtube.com/channel/UCkG4y9NJQ5yCys3jxFDUOcg/editing/profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Scroll down
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/scrolled_down.png' });

  const descInfo = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const matches = all.filter(el => (el.placeholder && el.placeholder.includes('About section')) || el.tagName === 'TEXTAREA' || (el.className && el.className.includes('description')));
    return matches.map(m => ({ tag: m.tagName, cls: m.className, id: m.id, ph: m.placeholder }));
  });
  console.log('Matches:', descInfo);

  await page.close();
}

main().catch(console.error);
