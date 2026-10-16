const { chromium } = require('playwright-core');

async function testClick() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  const page = pages[pages.length - 1];
  console.log('Page URL:', page.url());

  const items = await page.locator('[data-identifier], [data-email], li, [role="link"]').all();
  console.log('Found items count:', items.length);
  for (const item of items) {
    const text = await item.innerText().catch(() => '');
    const id = await item.getAttribute('data-identifier').catch(() => '');
    if (text.includes('msrosyafrin') || id.includes('msrosyafrin')) {
      console.log('Found Rosy item! Clicking...');
      await item.click();
      await page.waitForTimeout(5000);
      console.log('After click URL:', page.url());
      await page.screenshot({ path: 'tools/after_rosy_click.png' });
      break;
    }
  }
}

testClick().catch(console.error);
