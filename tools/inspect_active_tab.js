const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  console.log('Open pages:', pages.length);
  for (let i = 0; i < pages.length; i++) {
    const url = pages[i].url();
    console.log(`Page #${i}: ${url}`);
    if (url.includes('aistudio')) {
      await pages[i].screenshot({ path: `tools/page_${i}_inspect.png` });
      console.log(`Saved screenshot for Page #${i}`);
    }
  }
}

main().catch(console.error);
