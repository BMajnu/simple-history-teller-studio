const { chromium } = require('playwright-core');

const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes(CHANNEL_ID) && p.url().includes('editing')) || context.pages()[0];
  
  await page.bringToFront();
  
  // Scroll down
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'tools/c1_scrolled_handle.png' });
  
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, ytcp-form-input-container')).map(el => ({
      tag: el.tagName,
      id: el.id,
      cls: el.className,
      ariaLabel: el.getAttribute('aria-label'),
      value: el.value,
      placeholder: el.placeholder
    }));
  });
  console.log('Inputs found:', inputs);
  
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
