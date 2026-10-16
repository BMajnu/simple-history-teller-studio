const { chromium } = require('playwright-core');

const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes(CHANNEL_ID) && p.url().includes('editing')) || context.pages()[0];
  
  const descEl = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const matched = [];
    for (const el of all) {
      if (el.textContent && el.textContent.includes('Tell viewers about your channel') && el.children.length === 0) {
        matched.push({
          tag: el.tagName,
          id: el.id,
          cls: el.className,
          parentTag: el.parentElement?.tagName,
          parentId: el.parentElement?.id,
          parentCls: el.parentElement?.className,
          grandParentTag: el.parentElement?.parentElement?.tagName,
          grandParentId: el.parentElement?.parentElement?.id,
          grandParentCls: el.parentElement?.parentElement?.className
        });
      }
    }
    return matched;
  });
  console.log('Description placeholder element:', descEl);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
