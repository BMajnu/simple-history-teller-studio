const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-navigation-item, a, ytcp-navigation-item a'))
      .map(el => ({
        tag: el.tagName,
        text: (el.innerText || '').trim(),
        href: el.getAttribute('href') || el.closest('a')?.getAttribute('href') || '',
        id: el.id
      }))
      .filter(x => x.text.includes('Customization') || x.text.includes('Settings'));
  });

  console.log('Sidebar links:');
  console.dir(links, { depth: null });
  await page.close();
}

main().catch(console.error);
