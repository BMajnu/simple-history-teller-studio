const { chromium } = require('playwright-core');

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('editing')) || context.pages()[0];

  const errors = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.getAttribute('aria-invalid') === 'true') {
        list.push({ tag: el.tagName, id: el.id, cls: el.className, reason: 'aria-invalid', text: el.innerText || el.value });
      }
      if (el.id && el.id.includes('error') && el.innerText) {
        list.push({ tag: el.tagName, id: el.id, cls: el.className, reason: 'error-id', text: el.innerText });
      }
      if (el.className && typeof el.className === 'string' && el.className.includes('error') && el.innerText) {
        list.push({ tag: el.tagName, id: el.id, cls: el.className, reason: 'error-class', text: el.innerText });
      }
    });
    return list;
  });
  console.log('Errors found:', JSON.stringify(errors, null, 2));

  // Take screenshot of top half of page
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tools/c1_top_errors.png' });

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
