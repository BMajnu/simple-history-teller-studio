const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];
    console.log('Current URL:', page.url());

    // Click on badiuzzaman.majnu@gmail.com
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('li, div, span')).find(x => x.innerText && x.innerText.includes('badiuzzaman.majnu@gmail.com'));
      if (el) {
        console.log('Found element:', el.tagName);
        el.click();
      }
    });

    await page.waitForTimeout(5000);
    console.log('New URL:', page.url());
    console.log('Title:', await page.title());
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Page text snippet:\n', text.substring(0, 1000));
    await page.screenshot({ path: 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/signin_after_account_click.png' });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
