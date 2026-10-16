const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  await page.goto('https://studio.youtube.com/channel/UCvEQdVnctkuYZw3iNDo5krg/editing/profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const elements = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('input, textarea, ytcp-button, button, ytcp-text-field').forEach(el => {
      list.push({
        tag: el.tagName,
        id: el.id,
        className: el.className,
        type: el.getAttribute('type'),
        ariaLabel: el.getAttribute('aria-label'),
        placeholder: el.getAttribute('placeholder'),
        value: el.value || '',
        text: (el.innerText || '').slice(0, 30)
      });
    });
    return list;
  });

  console.log('Profile inputs & buttons:');
  console.dir(elements, { depth: null });
  await page.close();
}

main().catch(console.error);
