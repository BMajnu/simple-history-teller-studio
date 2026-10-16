const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const contexts = browser.contexts();
    const pages = contexts[0].pages();
    console.log('Pages count:', pages.length);
    for (let i = 0; i < pages.length; i++) {
      console.log(`Page [${i}]: Title: "${await pages[i].title()}" | URL: ${pages[i].url()}`);
    }
    const page = pages[0];
    const text = await page.evaluate(() => document.body.innerText);
    console.log('--- PAGE TEXT ---');
    console.log(text.substring(0, 1000));
    console.log('-----------------');
    await page.screenshot({ path: 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/signin_current_tab.png' });
    console.log('Saved signin_current_tab.png');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
