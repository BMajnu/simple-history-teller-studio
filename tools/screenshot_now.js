const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  console.log(`Total open pages: ${pages.length}`);
  
  for (let i = 0; i < pages.length; i++) {
    const url = pages[i].url();
    console.log(`Page #${i}: ${url}`);
    if (url.includes('aistudio.google.com/u/')) {
      await pages[i].screenshot({ path: 'tools/current_state.png' });
      console.log(`Captured screenshot from Page #${i} (${url})`);
      break;
    }
  }
}

main().catch(console.error);
