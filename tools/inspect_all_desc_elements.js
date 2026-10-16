const { chromium } = require('playwright-core');

const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes(CHANNEL_ID) && p.url().includes('editing')) || context.pages()[0];
  await page.bringToFront();

  const descEls = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all.filter(el => {
      const id = el.id || '';
      const cls = el.className || '';
      const aria = el.getAttribute('aria-label') || '';
      return id.toLowerCase().includes('desc') || 
             (typeof cls === 'string' && cls.toLowerCase().includes('desc')) || 
             aria.toLowerCase().includes('desc') ||
             el.tagName === 'TEXTAREA';
    }).map(el => ({
      tag: el.tagName,
      id: el.id,
      cls: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
      aria: el.getAttribute('aria-label'),
      text: el.innerText ? el.innerText.slice(0, 40) : '',
      value: el.value ? el.value.slice(0, 40) : ''
    }));
  });
  console.log('Description elements found:', JSON.stringify(descEls, null, 2));

  await page.screenshot({ path: 'tools/c1_desc_inspect_live.png' });
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
