const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  console.log('Open pages count:', pages.length);
  for (let i = 0; i < pages.length; i++) {
    console.log(`Page ${i}: URL = ${pages[i].url()} | Title = ${await pages[i].title()}`);
  }
  process.exit(0);
})();
