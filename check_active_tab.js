const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  console.log('Open pages:', pages.length);
  for (let i = 0; i < pages.length; i++) {
    console.log(`Page [${i}]: ${pages[i].url()}`);
  }
  const page = pages.find(p => p.url().includes('prompts')) || pages[0];
  await page.screenshot({ path: 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/aistudio_after_parallel.png' });
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Page text snippet:\n', text.slice(0, 500));
  process.exit(0);
})();
